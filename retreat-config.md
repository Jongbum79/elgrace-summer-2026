---
# 프로그램이 읽는 수련회 기본 설정입니다.
# 확정 전 예시값은 반드시 운영진 확인 후 수정하세요.
config:
  version: "draft-1"
  status: "draft"
  updated_at: "2026-05-30"
  updated_by: "수련회 디렉터"

retreat:
  title: "2026 전교인 여름수련회"
  church: "주은혜교회"
  director: "조봄이와"
  location: "크라운해태 연수원"
  start: "2026-07-27 12:00"
  end: "2026-07-30 15:00"

# 식사 인원은 구성원의 입소 시간 이후, 퇴소 시간 이전에 제공되는 식사만 집계합니다.
meals:
  attendance_rule: "arrival_lte_meal_time_and_departure_gt_meal_time"
  schedule:
    - id: "2026-07-27-lunch"
      label: "7월 27일 점심"
      time: "2026-07-27 12:00"
    - id: "2026-07-27-dinner"
      label: "7월 27일 저녁"
      time: "2026-07-27 18:00"
    - id: "2026-07-28-breakfast"
      label: "7월 28일 아침"
      time: "2026-07-28 08:00"
    - id: "2026-07-28-lunch"
      label: "7월 28일 점심"
      time: "2026-07-28 12:00"
    - id: "2026-07-28-dinner"
      label: "7월 28일 저녁"
      time: "2026-07-28 18:00"
    - id: "2026-07-29-breakfast"
      label: "7월 29일 아침"
      time: "2026-07-29 08:00"
    - id: "2026-07-29-lunch"
      label: "7월 29일 점심"
      time: "2026-07-29 12:00"
    - id: "2026-07-29-dinner"
      label: "7월 29일 저녁"
      time: "2026-07-29 18:00"
    - id: "2026-07-30-breakfast"
      label: "7월 30일 아침"
      time: "2026-07-30 08:00"

# 숙박비는 실제로 머무는 밤을 기준으로 계산합니다.
lodging:
  charge_rule: "overnight"
  nights:
    - id: "2026-07-27"
      label: "7월 27일 숙박"
      checkpoint: "2026-07-28 00:00"
    - id: "2026-07-28"
      label: "7월 28일 숙박"
      checkpoint: "2026-07-29 00:00"
    - id: "2026-07-29"
      label: "7월 29일 숙박"
      checkpoint: "2026-07-30 00:00"

# 아래 금액은 화면 개발을 위한 예시값입니다. 확정 전에 반드시 수정하세요.
fees:
  currency: "KRW"
  status: "example_values_require_confirmation"
  categories:
    adult:
      label: "성인"
      meal: 8000
      lodging_per_night: 35000
    high_school:
      label: "고등부"
      meal: 7000
      lodging_per_night: 30000
    middle_school:
      label: "중등부"
      meal: 7000
      lodging_per_night: 30000
    elementary:
      label: "초등부"
      meal: 6000
      lodging_per_night: 25000
    lower_elementary:
      label: "유년부"
      meal: 6000
      lodging_per_night: 25000
    kindergarten:
      label: "유치부"
      meal: 4000
      lodging_per_night: 10000
    infant:
      label: "유아"
      meal: 0
      lodging_per_night: 0
  extras:
    bedding:
      label: "추가 침구"
      unit_price: 5000
  discounts:
    family_maximum:
      enabled: false
      amount: 0
    manual_adjustment:
      enabled: true
      approval_required: true

rooms:
  check_in: "15:00"
  check_out: "11:00"
  assignment_priority:
    - "같은 가족은 가능한 한 같은 방에 배정한다."
    - "유아 동반 가족과 이동이 불편한 참석자를 우선 배정한다."
    - "형제 숙소와 자매 숙소는 원칙적으로 분리한다."
---

# 주은혜교회 수련회 운영 방침

이 문서는 수련회 일정, 방 배정 원칙, 식사 집계 기준, 회비 단가를 한곳에서 관리하기 위한 기준 문서입니다.

상단 YAML 영역은 프로그램이 자동 계산에 사용합니다. 아래 설명은 운영진이 함께 읽는 방침입니다. 값을 변경할 때는 YAML과 변경 기록을 함께 수정합니다.

## 회비 계산 원칙

가족 총 회비는 구성원별 회비를 합산해서 계산합니다.

```text
구성원 회비 = 포함되는 식사 수 x 해당 부서 식사 단가
            + 실제 숙박 수 x 해당 부서 숙박 단가
            + 추가 비용
            - 승인된 할인 또는 조정 금액

가족 총 회비 = 모든 구성원 회비의 합계
```

- 식사는 구성원의 입소 시간 이후부터 퇴소 시간 이전까지 제공되는 식사만 포함합니다.
- 외부에서 식사한 뒤 합류하거나 복귀하는 끼니는 참석 일정에는 포함하지만 식사 인원과 식비 계산에서는 제외합니다.
- 숙박은 해당 날짜 자정에 숙소에 머무는 구성원만 포함합니다.
- 가족별 특이사항으로 회비를 조정하면 사유와 승인자를 기록합니다.
- 단가가 변경되어도 이미 안내하거나 확정한 회비는 자동 변경하지 않습니다.
- 가족별 회비에는 계산 당시 적용한 `config.version`을 함께 저장합니다.

## 식사 집계 원칙

- 가족별 참석 날짜가 같아도 구성원마다 입소와 퇴소 시간을 따로 기록합니다.
- 식사 준비 인원은 각 식사 시간 기준으로 자동 집계합니다.
- 외출로 인해 특정 식사를 하지 않는 경우 가족별 예외 항목으로 기록합니다.
- 식사 업체에 전달하는 최종 인원은 자동 집계값을 확인한 뒤 별도로 확정합니다.

## 방 배정 원칙

- 기본적으로 가족 단위 배정을 우선합니다.
- 형제 숙소와 자매 숙소는 원칙적으로 분리합니다.
- 유아 동반 가족, 이동이 불편한 참석자, 늦은 입소자를 고려해 방을 조정합니다.
- 방 배정은 회비 계산과 분리합니다. 다만 실제 숙박 여부는 숙박비와 연결합니다.

## 설정 변경 절차

1. 상단 YAML 값을 수정합니다.
2. `config.version`, `config.updated_at`, `config.updated_by`를 수정합니다.
3. 아래 변경 기록에 이유를 남깁니다.
4. 운영 화면에서 새 설정을 읽은 뒤 계산 결과를 확인합니다.
5. 운영 중 변경이라면 기존 확정 회비에 적용할지 별도로 결정합니다.

## 확정 전 확인 목록

- [ ] 실제 수련회 날짜와 시간
- [ ] 수련회 장소
- [ ] 디렉터 이름
- [ ] 제공되는 식사 횟수와 시간
- [ ] 부서별 식사 단가
- [ ] 부서별 숙박 단가
- [ ] 추가 침구 비용
- [ ] 가족 최대 회비 적용 여부
- [ ] 할인 및 지원금 승인 방식
- [ ] 체크인 및 체크아웃 시간

## 변경 기록

| 날짜 | 버전 | 변경자 | 변경 내용 |
| --- | --- | --- | --- |
| 2026-05-30 | `draft-1` | 수련회 디렉터 | 최초 초안 작성. 일정과 단가는 확인이 필요한 예시값으로 입력함. |
