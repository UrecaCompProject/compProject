-- plans seed data from supabase/functions/_shared/data/plans.json
TRUNCATE TABLE public.plans RESTART IDENTITY CASCADE;
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (1, '데이터플랜300MB', 'LG U+', '통합요금제', '일반', '소용량', 28000, '300MB', 0.29296875, '400Kbps', '125분', 125, '150건', 150, '월제공량 내 차감', '월제공량 300MB 초과 시 차단', '데이터 소진 후 400Kbps로 무제한 이용 가능', []::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 1);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (2, '데이터플랜750MB', 'LG U+', '통합요금제', '일반', '소용량', 29000, '750MB', 0.732421875, '400Kbps', '125분', 125, '150건', 150, '월제공량 내 차감', '월제공량 750MB 초과 시 차단', '데이터 소진 후 400Kbps로 무제한 이용 가능', []::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 2);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (3, '데이터플랜1.5GB', 'LG U+', '통합요금제', '일반', '소용량', 33000, '1.5GB', 1.5, '400Kbps', '기본제공(월 300분)', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 1.5GB 초과 시 차단', '데이터 소진 후 400Kbps로 무제한 이용 가능', ["U+ZONE 무료"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 3);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (4, '데이터플랜5GB', 'LG U+', '통합요금제', '일반', '소용량', 37000, '5GB', 5, '400Kbps', '기본제공(월 300분)', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 5GB 초과 시 차단', '데이터 소진 후 400Kbps로 무제한 이용 가능', ["U+ZONE 무료"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 4);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (5, '데이터플랜9GB', 'LG U+', '통합요금제', '일반', '중소용량', 47000, '9GB', 9, '400Kbps', '기본제공(월 300분)', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 9GB 초과 시 차단', '데이터 소진 후 400Kbps로 무제한 이용 가능', ["U+ZONE 무료"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 5);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (6, '데이터플랜14GB', 'LG U+', '통합요금제', '일반', '중소용량', 55000, '14GB', 14, '1Mbps', '기본제공(월 300분)', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 14GB 초과 시 차단', '데이터 소진 후 1Mbps로 무제한 이용 가능', ["U+ZONE 무료"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 6);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (7, '데이터플랜24GB', 'LG U+', '통합요금제', '일반', '중용량', 59000, '24GB', 24, '1Mbps', '기본제공(월 300분)', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 24GB 초과 시 차단', '데이터 소진 후 1Mbps로 무제한 이용 가능', ["U+ZONE 무료"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 7);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (8, '데이터플랜31GB', 'LG U+', '통합요금제', '일반', '중용량', 61000, '31GB', 31, '1Mbps', '기본제공(월 300분)', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 31GB 초과 시 차단', '데이터 소진 후 1Mbps로 무제한 이용 가능', ["U+ZONE 무료"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 8);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (9, '데이터플랜50GB', 'LG U+', '통합요금제', '일반', '중용량', 63000, '50GB', 50, '1Mbps', '기본제공(월 300분)', 300, '기본제공', 9999, '기본제공량 내 40GB', '공유데이터 40GB 초과 시 차단', '데이터 소진 후 1Mbps로 무제한 이용 가능, 공유데이터 한도 40GB', ["U+ZONE 무료"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 9);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (10, '데이터플랜80GB', 'LG U+', '통합요금제', '일반', '대용량', 66000, '80GB', 80, '1Mbps', '기본제공(월 300분)', 300, '기본제공', 9999, '기본제공량 내 45GB', '공유데이터 45GB 초과 시 차단', '데이터 소진 후 1Mbps로 무제한 이용 가능, 공유데이터 한도 45GB', ["U+ZONE 무료"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 10);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (11, '데이터플랜95GB', 'LG U+', '통합요금제', '일반', '대용량', 68000, '95GB', 95, '3Mbps', '기본제공(월 300분)', 300, '기본제공', 9999, '기본제공량 내 50GB', '공유데이터 50GB 초과 시 차단', '데이터 소진 후 3Mbps로 무제한 이용 가능, 공유데이터 한도 50GB', ["U+ZONE 무료"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 11);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (12, '데이터플랜125GB', 'LG U+', '통합요금제', '일반', '대용량', 70000, '125GB', 125, '5Mbps', '기본제공(월 300분)', 300, '기본제공', 9999, '기본제공량 내 55GB', '공유데이터 55GB 초과 시 차단', '데이터 소진 후 5Mbps로 무제한 이용 가능, 공유데이터 한도 55GB', ["U+ZONE 무료"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 12);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (13, '데이터플랜MAX', 'LG U+', '통합요금제', '일반', '무제한', 85000, '무제한', 9999.99, '제한없음', '기본제공(월 300분)', 300, '기본제공', 9999, '별도 70GB', '공유데이터 별도 70GB 초과 시 차단', '데이터 무제한, 공유데이터 별도 70GB 제공, 2nd 디바이스 1회선 월정액 할인', ["U+ZONE 무료","2nd디바이스할인(1회선)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 13);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (14, '플러스플랜105', 'LG U+', '통합요금제', '일반', '무제한', 105000, '무제한', 9999.99, '제한없음', '기본제공(월 300분)', 300, '기본제공', 9999, '별도 100GB', '공유데이터 별도 100GB 초과 시 차단', '데이터 무제한, 공유데이터 100GB, 2nd 디바이스 2회선 할인 (구 5G 프리미어 플러스)', ["U+ZONE 무료","2nd디바이스할인(2회선)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 14);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (15, '디즈니+티빙 너겟65', 'LG U+', '너겟 5G 선납형+프리미엄플러스(OTT)', '일반', '무제한', 65000, '무제한', 9999.99, '제한없음', '기본제공(월 300분)', 300, '기본제공', 9999, '별도 80GB', '공유데이터 별도 80GB 초과 시 차단', '너겟65에 프리미엄플러스 디즈니+티빙 선택, 데이터 무제한, 실 체감가 11,200원/월, 너겟 앱 전용', ["OTT결합(디즈니 스탠다드+티빙 베이직, 월 19,400원 상당)","너겟쿠폰 18만원","VIP멤버십(24개월)","2nd디바이스할인(1회선)","파티페이결합(2~4회선 시 회선당 3,000원 할인)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 15);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (16, '넷플릭스 너겟65', 'LG U+', '너겟 5G 선납형+프리미엄플러스(OTT)', '일반', '무제한', 65000, '무제한', 9999.99, '제한없음', '기본제공(월 300분)', 300, '기본제공', 9999, '별도 80GB', '공유데이터 별도 80GB 초과 시 차단', '너겟65에 프리미엄플러스 넷플릭스 스탠다드 선택, 데이터 무제한, 너겟 앱 전용', ["OTT결합(넷플릭스 스탠다드, 월 13,500원 상당)","너겟쿠폰 18만원","VIP멤버십(24개월)","2nd디바이스할인(1회선)","파티페이결합(2~4회선 시 회선당 3,000원 할인)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 16);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (17, '구글AI 너겟65', 'LG U+', '너겟 5G 선납형+프리미엄플러스(AI)', '일반', '무제한', 65000, '무제한', 9999.99, '제한없음', '기본제공(월 300분)', 300, '기본제공', 9999, '별도 80GB', '공유데이터 별도 80GB 초과 시 차단', '너겟65에 프리미엄플러스 구글 AI 프로 선택, 제미나이 3 + 2TB 스토리지, 데이터 무제한, 너겟 앱 전용', ["AI결합(구글 AI 프로 무료, 월 29,000원 상당)","너겟쿠폰 18만원","VIP멤버십(24개월)","2nd디바이스할인(1회선)","파티페이결합(2~4회선 시 회선당 3,000원 할인)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 17);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (18, '5G 키즈 29', 'LG U+', '5G 키즈', '키즈(만 4~12세)', '소용량', 29000, '3.3GB', 3.3, '400Kbps', '기본제공', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 3.3GB 초과 시 차단', '만 4세 이상 12세 이하, 1인 1회선, 국제통화/060/로밍 발신 금지, 만 13세 익월 1일 청소년 혜택으로 자동변경', ["U+ZONE 무료"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 18);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (19, '5G 키즈 39', 'LG U+', '5G 키즈', '키즈(만 4~12세)', '소용량', 39000, '5.5GB', 5.5, '1Mbps', '기본제공', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 5.5GB 초과 시 차단', '만 4세 이상 12세 이하, 1인 1회선, 국제통화/060/로밍 발신 금지, 만 13세 익월 1일 청소년 혜택으로 자동변경', ["U+ZONE 무료"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 19);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (20, '5G 키즈 45', 'LG U+', '5G 키즈', '키즈(만 4~12세)', '중소용량', 45000, '9GB', 9, '1Mbps', '기본제공', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 9GB 초과 시 차단', '만 4세 이상 12세 이하, 1인 1회선, 국제통화/060/로밍 발신 금지, 2022.2.4부터 가입 가능', ["U+ZONE 무료"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 20);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (21, '데이터플랜1.5GB(청소년혜택)', 'LG U+', '통합요금제+세그혜택', '청소년(만 13~18세)', '소용량', 33000, '2.5GB', 2.5, '400Kbps', '기본제공', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 2.5GB 초과 시 차단', '데이터플랜1.5GB에 청소년 세그 혜택 적용, 만 20세 익월 1일 청년 혜택으로 자동변경, 데이터 쉐어링/주고받기 불가', ["U+ZONE 무료","데이터증량(1.5GB→2.5GB)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 21);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (22, '데이터플랜5GB(청소년혜택)', 'LG U+', '통합요금제+세그혜택', '청소년(만 13~18세)', '소용량', 37000, '7GB', 7, '400Kbps', '기본제공', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 7GB 초과 시 차단', '데이터플랜5GB에 청소년 세그 혜택 적용, 만 20세 익월 1일 청년 혜택으로 자동변경, 데이터 쉐어링/주고받기 불가', ["U+ZONE 무료","데이터증량(5GB→7GB)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 22);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (23, '데이터플랜9GB(청소년혜택)', 'LG U+', '통합요금제+세그혜택', '청소년(만 13~18세)', '중소용량', 47000, '11GB', 11, '1Mbps', '기본제공', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 11GB 초과 시 차단', '데이터플랜9GB에 청소년 세그 혜택 적용, 만 20세 익월 1일 청년 혜택으로 자동변경, 데이터 쉐어링/주고받기 불가', ["U+ZONE 무료","데이터증량(9GB→11GB)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 23);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (24, '데이터플랜14GB(청소년혜택)', 'LG U+', '통합요금제+세그혜택', '청소년(만 13~18세)', '중소용량', 55000, '17GB', 17, '1Mbps', '기본제공', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 17GB 초과 시 차단', '데이터플랜14GB에 청소년 세그 혜택 적용, 만 20세 익월 1일 청년 혜택으로 자동변경, 데이터 쉐어링/주고받기 불가', ["U+ZONE 무료","데이터증량(14GB→17GB)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 24);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (25, '데이터플랜24GB(청소년혜택)', 'LG U+', '통합요금제+세그혜택', '청소년(만 13~18세)', '중용량', 59000, '31GB', 31, '1Mbps', '기본제공(월 300분)', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 31GB 초과 시 차단', '데이터플랜24GB에 청소년 세그 혜택 적용, 만 20세 익월 1일 청년 혜택으로 자동변경', ["U+ZONE 무료","데이터증량(24GB→31GB)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 25);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (26, '데이터플랜31GB(청소년혜택)', 'LG U+', '통합요금제+세그혜택', '청소년(만 13~18세)', '중용량', 61000, '40GB', 40, '1Mbps', '기본제공(월 300분)', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 40GB 초과 시 차단', '데이터플랜31GB에 청소년 세그 혜택 적용, 만 20세 익월 1일 청년 혜택으로 자동변경', ["U+ZONE 무료","데이터증량(31GB→40GB)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 26);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (27, '데이터플랜50GB(청소년혜택)', 'LG U+', '통합요금제+세그혜택', '청소년(만 13~18세)', '중용량', 63000, '65GB', 65, '1Mbps', '기본제공(월 300분)', 300, '기본제공', 9999, '기본제공량 내 40GB', '공유데이터 40GB 초과 시 차단', '데이터플랜50GB에 청소년 세그 혜택 적용, 만 20세 익월 1일 청년 혜택으로 자동변경', ["U+ZONE 무료","데이터증량(50GB→65GB)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 27);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (28, '데이터플랜5GB(유쓰혜택)', 'LG U+', '통합요금제+세그혜택', '청년(만 19~34세)', '중소용량', 37000, '9GB', 9, '400Kbps', '기본제공(월 300분)', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 9GB 초과 시 차단', '데이터플랜5GB에 유쓰(청년) 세그 혜택 적용, 만 35세 익월 1일 일반 요금제로 전환', ["U+ZONE 무료","데이터증량(5GB→9GB)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 28);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (29, '데이터플랜9GB(유쓰혜택)', 'LG U+', '통합요금제+세그혜택', '청년(만 19~34세)', '중소용량', 47000, '15GB', 15, '400Kbps', '기본제공(월 300분)', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 15GB 초과 시 차단', '데이터플랜9GB에 유쓰(청년) 세그 혜택 적용, 만 35세 익월 1일 일반 요금제로 전환', ["U+ZONE 무료","데이터증량(9GB→15GB)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 29);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (30, '데이터플랜14GB(유쓰혜택)', 'LG U+', '통합요금제+세그혜택', '청년(만 19~34세)', '중용량', 55000, '26GB', 26, '1Mbps', '기본제공(월 300분)', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 26GB 초과 시 차단', '데이터플랜14GB에 유쓰(청년) 세그 혜택 적용, 만 35세 익월 1일 일반 요금제로 전환', ["U+ZONE 무료","데이터증량(14GB→26GB)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 30);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (31, '데이터플랜24GB(유쓰혜택)', 'LG U+', '통합요금제+세그혜택', '청년(만 19~34세)', '중용량', 59000, '36GB', 36, '1Mbps', '기본제공(월 300분)', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 36GB 초과 시 차단', '데이터플랜24GB에 유쓰(청년) 세그 혜택 적용, 만 35세 익월 1일 일반 요금제로 전환', ["U+ZONE 무료","데이터증량(24GB→36GB)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 31);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (32, '데이터플랜31GB(유쓰혜택)', 'LG U+', '통합요금제+세그혜택', '청년(만 19~34세)', '중용량', 61000, '46GB', 46, '1Mbps', '기본제공(월 300분)', 300, '기본제공', 9999, '월제공량 내 차감', '월제공량 46GB 초과 시 차단', '데이터플랜31GB에 유쓰(청년) 세그 혜택 적용, 만 35세 익월 1일 일반 요금제로 전환', ["U+ZONE 무료","데이터증량(31GB→46GB)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 32);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (33, '데이터플랜50GB(유쓰혜택)', 'LG U+', '통합요금제+세그혜택', '청년(만 19~34세)', '대용량', 63000, '70GB', 70, '1Mbps', '기본제공(월 300분)', 300, '기본제공', 9999, '기본제공량 내 40GB', '공유데이터 40GB 초과 시 차단', '데이터플랜50GB에 유쓰(청년) 세그 혜택 적용, 만 35세 익월 1일 일반 요금제로 전환', ["U+ZONE 무료","데이터증량(50GB→70GB)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 33);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (34, '데이터플랜95GB(유쓰혜택)', 'LG U+', '통합요금제+세그혜택', '청년(만 19~34세)', '대용량', 68000, '135GB', 135, '3Mbps', '기본제공(월 300분)', 300, '기본제공', 9999, '기본제공량 내 50GB', '공유데이터 50GB 초과 시 차단', '데이터플랜95GB에 유쓰(청년) 세그 혜택 적용, 만 35세 익월 1일 일반 요금제로 전환', ["U+ZONE 무료","데이터증량(95GB→135GB)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 34);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (35, '디즈니+티빙 너겟69(청년추천)', 'LG U+', '너겟 5G 선납형+프리미엄플러스(OTT)', '청년(만 19~34세)', '무제한', 69000, '무제한', 9999.99, '제한없음', '기본제공(월 300분)', 300, '기본제공', 9999, '별도 100GB', '공유데이터 별도 100GB 초과 시 차단', '너겟69에 프리미엄플러스 디즈니+티빙 선택, 데이터 무제한, 실 체감가 -9,900원/월, 최대 78,900원/월 상당 혜택, 너겟 앱 전용', ["OTT결합(디즈니 스탠다드+티빙 베이직, 월 19,400원 상당)","너겟쿠폰 18만원","VIP멤버십(24개월)","2nd디바이스할인(2회선)","파티페이결합(2~4회선 시 회선당 3,000원 할인)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 35);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (36, '넷플릭스 너겟69(청년추천)', 'LG U+', '너겟 5G 선납형+프리미엄플러스(OTT)', '청년(만 19~34세)', '무제한', 69000, '무제한', 9999.99, '제한없음', '기본제공(월 300분)', 300, '기본제공', 9999, '별도 100GB', '공유데이터 별도 100GB 초과 시 차단', '너겟69에 프리미엄플러스 넷플릭스 프리미엄 선택, 데이터 무제한, 너겟 앱 전용', ["OTT결합(넷플릭스 프리미엄, 월 17,000원 상당)","너겟쿠폰 18만원","VIP멤버십(24개월)","2nd디바이스할인(2회선)","파티페이결합(2~4회선 시 회선당 3,000원 할인)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 36);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (37, '구글AI 너겟69(청년추천)', 'LG U+', '너겟 5G 선납형+프리미엄플러스(AI)', '청년(만 19~34세)', '무제한', 69000, '무제한', 9999.99, '제한없음', '기본제공(월 300분)', 300, '기본제공', 9999, '별도 100GB', '공유데이터 별도 100GB 초과 시 차단', '너겟69에 프리미엄플러스 구글 AI 프로 선택, 제미나이 3 + 2TB 스토리지, 데이터 무제한, 너겟 앱 전용', ["AI결합(구글 AI 프로 무료, 월 29,000원 상당)","너겟쿠폰 18만원","VIP멤버십(24개월)","2nd디바이스할인(2회선)","파티페이결합(2~4회선 시 회선당 3,000원 할인)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 37);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (38, '너겟 5G 20GB 36(청년전용혜택)', 'LG U+', '너겟 5G 선납형+청년혜택', '청년(만 19~29세)', '중용량', 36000, '29GB', 29, '1Mbps', '기본제공(월 300분)', 300, '기본제공', 9999, '불가', '월제공량 29GB 초과 시 차단', '너겟 5G 20GB 36에 청년 전용 혜택 적용, 만 30세 익월 혜택 종료, 너겟 앱 전용', ["파티페이결합(2~4회선 시 회선당 3,000원 할인)","청년전용데이터추가(20GB→29GB)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 38);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (39, '데이터플랜5GB(복지혜택)', 'LG U+', '통합요금제+세그혜택', '복지(장애인)', '소용량', 37000, '6GB', 6, '400Kbps', '기본제공(월 600분)', 600, '기본제공', 9999, '월제공량 내 차감', '월제공량 6GB 초과 시 차단', '데이터플랜5GB에 복지 세그 혜택 적용, 장애인, 영업점/고객센터 신청 필요, 명의자당 1인 1회선', ["U+ZONE 무료","데이터증량(5GB→6GB)","음성통화증량(300분→600분)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 39);
INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (40, '데이터플랜9GB(복지혜택)', 'LG U+', '통합요금제+세그혜택', '복지(장애인)', '중소용량', 47000, '10GB', 10, '1Mbps', '기본제공(월 600분)', 600, '기본제공', 9999, '월제공량 내 차감', '월제공량 10GB 초과 시 차단', '데이터플랜9GB에 복지 세그 혜택 적용, 장애인, 영업점/고객센터 신청 필요, 명의자당 1인 1회선', ["U+ZONE 무료","데이터증량(9GB→10GB)","음성통화증량(300분→600분)"]::jsonb, '[]'::jsonb, '[]'::jsonb, NULL, true, 40);

-- ============================================================
-- Dummy data for 2 users
-- ============================================================

INSERT INTO auth.users (id, aud, role, email, encrypted_password, email_confirmed_at, raw_app_meta_data, raw_user_meta_data, created_at, updated_at) VALUES
('11111111-1111-1111-1111-111111111111', 'authenticated', 'authenticated', 'user1@example.com', crypt('password', gen_salt('bf')), now(), '{}', '{"name":"UserOne","phone":"010-1111-1111","age_group":"일반"}', now(), now()),
('22222222-2222-2222-2222-222222222222', 'authenticated', 'authenticated', 'user2@example.com', crypt('password', gen_salt('bf')), now(), '{}', '{"name":"UserTwo","phone":"010-2222-2222","age_group":"청년"}', now(), now());


INSERT INTO public.accessibility_settings (user_id, easy_mode, large_font) VALUES
('11111111-1111-1111-1111-111111111111', false, false),
('22222222-2222-2222-2222-222222222222', true, false);

INSERT INTO public.current_plans (user_id, plan_id, started_at) VALUES
('11111111-1111-1111-1111-111111111111', 1, '2025-01-15'),
('22222222-2222-2222-2222-222222222222', 5, '2024-11-01');

INSERT INTO public.saved_plans (user_id, plan_id) VALUES
('11111111-1111-1111-1111-111111111111', 2),
('11111111-1111-1111-1111-111111111111', 3),
('11111111-1111-1111-1111-111111111111', 4),
('22222222-2222-2222-2222-222222222222', 6),
('22222222-2222-2222-2222-222222222222', 7);

INSERT INTO public.usage_monthly (user_id, year_month, data_used_gb, call_used_min, sms_used_count) VALUES
('11111111-1111-1111-1111-111111111111', '2025-03', 3.5, 120, 30),
('11111111-1111-1111-1111-111111111111', '2025-04', 4.2, 150, 45),
('11111111-1111-1111-1111-111111111111', '2025-05', 5.1, 110, 25),
('11111111-1111-1111-1111-111111111111', '2025-06', 4.8, 130, 35),
('11111111-1111-1111-1111-111111111111', '2025-07', 5.5, 140, 40),
('11111111-1111-1111-1111-111111111111', '2025-08', 4.9, 125, 32),
('22222222-2222-2222-2222-222222222222', '2025-06', 8.2, 200, 60),
('22222222-2222-2222-2222-222222222222', '2025-07', 9.1, 220, 75),
('22222222-2222-2222-2222-222222222222', '2025-08', 8.7, 210, 70);

INSERT INTO public.usage_patterns (user_id, avg_data_gb, avg_call_min, avg_sms_count, over_usage_data, trend_6m, trend_12m) VALUES
('11111111-1111-1111-1111-111111111111', 4.7, 129, 35, false, '[]'::jsonb, '[]'::jsonb),
('22222222-2222-2222-2222-222222222222', 8.7, 210, 68, false, '[]'::jsonb, '[]'::jsonb);

INSERT INTO public.consultation_reports (id, user_id, summary_title, summary, current_plan_id, total_savings) VALUES
('r1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', '요금제 추천 결과', '현재 요금제보다 월 9,000원 절약 가능한 옵션을 찾았습니다.', 1, 9000);

INSERT INTO public.report_recommendations (report_id, plan_id, reason, savings, sort_order) VALUES
('r1111111-1111-1111-1111-111111111111', 2, '데이터 5GB로 월 9,000원 절약', 9000, 1),
('r1111111-1111-1111-1111-111111111111', 4, '데이터 여유롭고 혜택 풍부', 3000, 2);

INSERT INTO public.consultation_satisfactions (report_id, rating, feedback) VALUES
('r1111111-1111-1111-1111-111111111111', 'good', '추천이 유용했어요');

INSERT INTO public.attendances (user_id, date, reward_type, reward_value) VALUES
('11111111-1111-1111-1111-111111111111', '2025-08-19', 'badge', 1),
('11111111-1111-1111-1111-111111111111', '2025-08-20', 'badge', 1),
('11111111-1111-1111-1111-111111111111', '2025-08-21', 'badge', 1),
('22222222-2222-2222-2222-222222222222', '2025-08-20', 'badge', 1),
('22222222-2222-2222-2222-222222222222', '2025-08-21', 'badge', 1);

INSERT INTO public.attendance_streaks (user_id, current_streak, longest_streak, last_attended_at) VALUES
('11111111-1111-1111-1111-111111111111', 3, 3, '2025-08-21'),
('22222222-2222-2222-2222-222222222222', 2, 2, '2025-08-21');

INSERT INTO public.badges (id, name, description, type) VALUES
('b1111111-1111-1111-1111-111111111111', '첫 출석', '첫 출석 보상', 'attendance'),
('b2222222-2222-2222-2222-222222222222', '첫 상담', '첫 AI 상담 완료', 'consultation'),
('b3333333-3333-3333-3333-333333333333', '첫 교환', '첫 쿠폰 교환', 'exchange');

INSERT INTO public.user_badges (user_id, badge_id, balance, total_earned) VALUES
('11111111-1111-1111-1111-111111111111', 'b1111111-1111-1111-1111-111111111111', 3, 3),
('11111111-1111-1111-1111-111111111111', 'b2222222-2222-2222-2222-222222222222', 1, 1),
('11111111-1111-1111-1111-111111111111', 'b3333333-3333-3333-3333-333333333333', 0, 0),
('22222222-2222-2222-2222-222222222222', 'b1111111-1111-1111-1111-111111111111', 2, 2),
('22222222-2222-2222-2222-222222222222', 'b2222222-2222-2222-2222-222222222222', 1, 1);

INSERT INTO public.missions (id, name, condition_type, condition_value, reward_badge_id, reward_amount) VALUES
('m1111111-1111-1111-1111-111111111111', '3일 연속 출석', 'attendance_streak', 3, 'b1111111-1111-1111-1111-111111111111', 1),
('m2222222-2222-2222-2222-222222222222', 'AI 상담 완료', 'consultation', 1, 'b2222222-2222-2222-2222-222222222222', 1);

INSERT INTO public.user_missions (user_id, mission_id, status, completed_at) VALUES
('11111111-1111-1111-1111-111111111111', 'm1111111-1111-1111-1111-111111111111', 'completed', now()),
('11111111-1111-1111-1111-111111111111', 'm2222222-2222-2222-2222-222222222222', 'in_progress', NULL),
('22222222-2222-2222-2222-222222222222', 'm1111111-1111-1111-1111-111111111111', 'completed', now());

INSERT INTO public.games (id, type, name) VALUES
('g1111111-1111-1111-1111-111111111111', 'quiz', '요금제 퀴즈'),
('g2222222-2222-2222-2222-222222222222', 'roulette', '룰렛 이벤트');

INSERT INTO public.game_results (user_id, game_id, score, played_at) VALUES
('11111111-1111-1111-1111-111111111111', 'g1111111-1111-1111-1111-111111111111', 100, now()),
('22222222-2222-2222-2222-222222222222', 'g1111111-1111-1111-1111-111111111111', 80, now()),
('22222222-2222-2222-2222-222222222222', 'g2222222-2222-2222-2222-222222222222', 50, now());

INSERT INTO public.products (id, name, description, required_badges, stock, is_active) VALUES
('p1111111-1111-1111-1111-111111111111', '스타벅스 아메리카노', '스타벅스 아메리카노 기프티콘', 3, 100, true),
('p2222222-2222-2222-2222-222222222222', '베스킨라빈스 싱글레귤러', '베스킨라빈스 싱글레귤러 쿠폰', 5, 50, true);

INSERT INTO public.exchanges (id, user_id, product_id, used_badges) VALUES
('e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', 3);

INSERT INTO public.coupons (id, exchange_id, user_id, product_id, barcode, encrypted_code, status, expired_at) VALUES
('c1111111-1111-1111-1111-111111111111', 'e1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'p1111111-1111-1111-1111-111111111111', '1234567890', 'enc_1234567890', 'used', '2026-08-21');

INSERT INTO public.coupon_usages (coupon_id, store_name) VALUES
('c1111111-1111-1111-1111-111111111111', '스타벅스 강남점');

INSERT INTO public.subscription_applications (id, user_id, target_plan_id, current_plan_id, status, terms_agreed_at, requested_at) VALUES
('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 2, 1, 'completed', now() - interval '3 days', now() - interval '3 days');

INSERT INTO public.subscription_status_logs (application_id, status, changed_at, note) VALUES
('a1111111-1111-1111-1111-111111111111', 'submitted', now() - interval '3 days', '신청 접수'),
('a1111111-1111-1111-1111-111111111111', 'in_review', now() - interval '2 days', '서류 검토 중'),
('a1111111-1111-1111-1111-111111111111', 'completed', now() - interval '1 day', '가입 완료');

INSERT INTO public.terms_consents (user_id, application_id, term_type, version, agreed_at, ip) VALUES
('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'privacy', 'v1.0', now() - interval '3 days', '127.0.0.1'),
('11111111-1111-1111-1111-111111111111', 'a1111111-1111-1111-1111-111111111111', 'service', 'v1.0', now() - interval '3 days', '127.0.0.1'),
('22222222-2222-2222-2222-222222222222', NULL, 'privacy', 'v1.0', now() - interval '1 day', '127.0.0.1');

INSERT INTO public.notifications (user_id, type, title, body, sent_at, read_at) VALUES
('11111111-1111-1111-1111-111111111111', 'recommendation', '추천 요금제 도착', '월 9,000원 절약 가능한 요금제를 확인해보세요.', now() - interval '1 day', now() - interval '1 day'),
('11111111-1111-1111-1111-111111111111', 'attendance', '출석 보상 지급', '연속 출석 보상이 지급되었어요.', now(), NULL),
('22222222-2222-2222-2222-222222222222', 'recommendation', 'AI 상담 완료', '요금제 추천 보고서가 준비되었어요.', now(), NULL);

INSERT INTO public.referrals (referrer_user_id, referred_user_id, referral_code, status, reward_given_at) VALUES
('11111111-1111-1111-1111-111111111111', '22222222-2222-2222-2222-222222222222', 'KAKAO123', 'completed', now() - interval '1 day');
