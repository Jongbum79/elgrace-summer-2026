#!/usr/bin/env python3
"""Local static server for the retreat dashboard."""

from __future__ import annotations

import os
import json
import csv
import urllib.request
import io
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


ROOT = Path(__file__).resolve().parent


class RetreatHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(ROOT), **kwargs)

    def do_GET(self):
        if self.path == '/api/family-db':
            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            
            try:
                sheet_id = '1LDpA-cvYu9FS7e7eYSrxDPFHob2rOrJc_4jbpXi_-PE'
                csv_url = f'https://docs.google.com/spreadsheets/d/{sheet_id}/export?format=csv'
                
                req = urllib.request.Request(csv_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as response:
                    csv_data = response.read().decode('utf-8')
                
                reader = csv.DictReader(io.StringIO(csv_data))
                data = list(reader)
                
                self.wfile.write(json.dumps(data, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                error_response = [{"error": str(e)}]
                self.wfile.write(json.dumps(error_response, ensure_ascii=False).encode('utf-8'))
            return

        elif self.path == '/api/config':
            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            try:
                load_env()
                config_data = {
                    "googleClientId": os.environ.get("GOOGLE_CLIENT_ID", "582144992351-iehddqkp7emjrkap1bh97p7fd5c3p8vf.apps.googleusercontent.com"),
                    "driveFolderId": os.environ.get("GOOGLE_DRIVE_FOLDER_ID", "1WVtAhmSZ5OTZ9DOX0_afVPlegznir5KS")
                }
                self.wfile.write(json.dumps(config_data, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.wfile.write(json.dumps({"error": str(e)}, ensure_ascii=False).encode('utf-8'))
            return

        elif self.path.startswith('/api/drive-files'):
            self.send_response(200)
            self.send_header('Content-type', 'application/json; charset=utf-8')
            self.end_headers()
            
            try:
                load_env()
                api_key = os.environ.get("GOOGLE_API_KEY", "")
                
                import urllib.parse
                parsed_path = urllib.parse.urlparse(self.path)
                params = urllib.parse.parse_qs(parsed_path.query)
                
                folder_id = params.get("folderId", ["1WVtAhmSZ5OTZ9DOX0_afVPlegznir5KS"])[0]
                
                # Load local uploads metadata
                local_uploads = []
                upload_dir = ROOT / 'uploaded_docs'
                meta_path = upload_dir / 'metadata.json'
                if meta_path.exists():
                    try:
                        with open(meta_path, 'r', encoding='utf-8') as f:
                            local_uploads = json.load(f)
                    except Exception:
                        pass
                
                local_uploads = [f for f in local_uploads if f.get("folderId") == folder_id]
                
                if not api_key:
                    # Return mock data + local uploads
                    response_data = {
                        "warning": "NO_API_KEY",
                        "files": get_mock_files_for_folder(folder_id) + local_uploads
                    }
                    self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode('utf-8'))
                    return
                
                # Fetch files from Google Drive API
                q_query = f"'{folder_id}' in parents and trashed = false"
                fields = "files(id,name,mimeType,size,modifiedTime,webViewLink,owners)"
                drive_url = f"https://www.googleapis.com/drive/v3/files?q={urllib.parse.quote(q_query)}&fields={urllib.parse.quote(fields)}&key={api_key}"
                
                req = urllib.request.Request(drive_url, headers={'User-Agent': 'Mozilla/5.0'})
                with urllib.request.urlopen(req) as response:
                    res_data = json.loads(response.read().decode('utf-8'))
                
                files = res_data.get("files", []) + local_uploads
                self.wfile.write(json.dumps({"files": files}, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.wfile.write(json.dumps({"error": str(e)}, ensure_ascii=False).encode('utf-8'))
            return
            
        super().do_GET()

    def do_POST(self):
        if self.path == '/api/drive-upload':
            try:
                content_type = self.headers.get('Content-Type', '')
                content_length = int(self.headers.get('Content-Length', 0))
                
                body = self.rfile.read(content_length)
                
                boundary = content_type.split("boundary=")[-1].encode('utf-8')
                parts = body.split(boundary)
                
                file_data = b""
                filename = "uploaded_file"
                folder_id = "1WVtAhmSZ5OTZ9DOX0_afVPlegznir5KS"
                
                for part in parts:
                    if b'filename=' in part:
                        try:
                            headers_part, file_data_part = part.split(b'\r\n\r\n', 1)
                            if file_data_part.endswith(b'\r\n--'):
                                file_data_part = file_data_part[:-4]
                            elif file_data_part.endswith(b'\r\n'):
                                file_data_part = file_data_part[:-2]
                            
                            file_data = file_data_part
                            for line in headers_part.decode('utf-8', errors='ignore').split('\r\n'):
                                if 'filename=' in line:
                                    filename = line.split('filename=')[-1].strip('"')
                                    break
                        except Exception as e:
                            print("Error parsing part:", e)
                    elif b'name="folderId"' in part:
                        try:
                            _, val_part = part.split(b'\r\n\r\n', 1)
                            folder_id = val_part.strip().decode('utf-8')
                        except Exception:
                            pass
                
                # Save file locally
                upload_dir = ROOT / 'uploaded_docs'
                upload_dir.mkdir(exist_ok=True)
                
                save_path = upload_dir / filename
                with open(save_path, 'wb') as f:
                    f.write(file_data)
                
                # Save metadata
                meta_path = upload_dir / 'metadata.json'
                metadata = []
                if meta_path.exists():
                    try:
                        with open(meta_path, 'r', encoding='utf-8') as f:
                            metadata = json.load(f)
                    except Exception:
                        pass
                
                import datetime
                import os
                new_file_meta = {
                    "id": f"local_{os.urandom(4).hex()}",
                    "name": filename,
                    "mimeType": "application/octet-stream",
                    "size": str(len(file_data)),
                    "modifiedTime": datetime.datetime.now().isoformat() + "Z",
                    "webViewLink": f"/uploaded_docs/{filename}",
                    "folderId": folder_id,
                    "owners": [{"displayName": "로컬 사용자"}]
                }
                metadata.append(new_file_meta)
                with open(meta_path, 'w', encoding='utf-8') as f:
                    json.dump(metadata, f, ensure_ascii=False, indent=2)
                
                self.send_response(200)
                self.send_header('Content-type', 'application/json; charset=utf-8')
                self.end_headers()
                
                self.wfile.write(json.dumps({"success": True, "file": new_file_meta}, ensure_ascii=False).encode('utf-8'))
            except Exception as e:
                self.send_response(500)
                self.send_header('Content-type', 'application/json; charset=utf-8')
                self.end_headers()
                self.wfile.write(json.dumps({"success": False, "message": str(e)}, ensure_ascii=False).encode('utf-8'))
            return
            
        self.send_response(404)
        self.end_headers()

def load_env():
    env_path = ROOT / '.env'
    if env_path.exists():
        with open(env_path, 'r', encoding='utf-8') as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith('#') and '=' in line:
                    key, val = line.split('=', 1)
                    os.environ[key.strip()] = val.strip()

def get_mock_files_for_folder(folder_id):
    if folder_id == "1WVtAhmSZ5OTZ9DOX0_afVPlegznir5KS":
        return [
            { "id": "folder_admin", "name": "기획 및 행정", "mimeType": "application/vnd.google-apps.folder", "owners": [{"displayName": "시스템"}] },
            { "id": "folder_budget", "name": "예산 및 재정", "mimeType": "application/vnd.google-apps.folder", "owners": [{"displayName": "시스템"}] },
            { "id": "folder_program", "name": "프로그램 & 악보", "mimeType": "application/vnd.google-apps.folder", "owners": [{"displayName": "시스템"}] },
            { "id": "folder_guide", "name": "안내 및 매뉴얼", "mimeType": "application/vnd.google-apps.folder", "owners": [{"displayName": "시스템"}] }
        ]
    
    mock_db = [
      { "name": "2026_여름수련회_기획안.pdf", "mimeType": "application/pdf", "size": "2516582", "folder": "기획 및 행정", "modifiedTime": "2026-06-01T10:00:00.000Z", "owners": [{"displayName": "조봄이와"}], "webViewLink": "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKv3dBt28vJUX078y1/edit?usp=sharing" },
      { "name": "수련회_예산안_및_집행계획.xlsx", "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "size": "1887436", "folder": "예산 및 재정", "modifiedTime": "2026-05-28T14:30:00.000Z", "owners": [{"displayName": "김상배"}], "webViewLink": "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKv3dBt28vJUX078y1/edit?usp=sharing" },
      { "name": "숙소배정표_최종본.xlsx", "mimeType": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", "size": "972800", "folder": "기획 및 행정", "modifiedTime": "2026-06-05T09:15:00.000Z", "owners": [{"displayName": "윤선욱"}], "webViewLink": "https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKv3dBt28vJUX078y1/edit?usp=sharing" },
      { "name": "식사수요조사_결과보고.docx", "mimeType": "application/vnd.openxmlformats-officedocument.wordprocessingml.document", "size": "1258291", "folder": "안내 및 매뉴얼", "modifiedTime": "2026-06-02T11:20:00.000Z", "owners": [{"displayName": "김미현"}], "webViewLink": "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKv3dBt28vJUX078y1/edit?usp=sharing" },
      { "name": "수련회_안내문_및_준비물.pdf", "mimeType": "application/pdf", "size": "3250585", "folder": "안내 및 매뉴얼", "modifiedTime": "2026-06-04T16:00:00.000Z", "owners": [{"displayName": "장세연"}], "webViewLink": "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKv3dBt28vJUX078y1/edit?usp=sharing" },
      { "name": "찬양콘서트_콘티_및_악보.pdf", "mimeType": "application/pdf", "size": "8912896", "folder": "프로그램 & 악보", "modifiedTime": "2026-06-03T18:45:00.000Z", "owners": [{"displayName": "이지은A"}], "webViewLink": "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKv3dBt28vJUX078y1/edit?usp=sharing" },
      { "name": "안전관리_및_비상연락망.pdf", "mimeType": "application/pdf", "size": "870400", "folder": "안내 및 매뉴얼", "modifiedTime": "2026-05-30T10:10:00.000Z", "owners": [{"displayName": "박철진"}], "webViewLink": "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKv3dBt28vJUX078y1/edit?usp=sharing" },
      { "name": "조별성경공부_가이드북.pdf", "mimeType": "application/pdf", "size": "4404019", "folder": "프로그램 & 악보", "modifiedTime": "2026-06-02T15:30:00.000Z", "owners": [{"displayName": "박철진"}], "webViewLink": "https://docs.google.com/document/d/1BxiMVs0XRA5nFMdKv3dBt28vJUX078y1/edit?usp=sharing" }
    ]
    
    folder_name_map = {
      "folder_admin": "기획 및 행정",
      "folder_budget": "예산 및 재정",
      "folder_program": "프로그램 & 악보",
      "folder_guide": "안내 및 매뉴얼"
    }
    target_folder = folder_name_map.get(folder_id, folder_id)
    return [f for f in mock_db if f.get("folder") == target_folder]



if __name__ == "__main__":
    port = int(os.environ.get("PORT", "4173"))
    server = ThreadingHTTPServer(("127.0.0.1", port), RetreatHandler)
    print(f"Retreat dashboard server running at http://127.0.0.1:{port}/")
    server.serve_forever()
