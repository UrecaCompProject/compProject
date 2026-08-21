const fs = require('fs');
const path = require('path');

const raw = JSON.parse(
  fs.readFileSync(
    path.join(
      __dirname,
      '..',
      'supabase',
      'functions',
      '_shared',
      'data',
      'plans.json',
    ),
    'utf8',
  ),
);
const plans = Array.isArray(raw) ? raw : raw.plans;

const parseData = (s) => {
  if (s.includes('무제한')) return 9999.99;
  const m = s.match(/([0-9.]+)\s*(GB|MB|KB)/i);
  if (!m) return 0;
  const v = parseFloat(m[1]);
  const u = m[2].toUpperCase();
  if (u === 'GB') return v;
  if (u === 'MB') return v / 1024;
  if (u === 'KB') return v / (1024 * 1024);
  return v;
};

const parseVoice = (s) => {
  const m = s.match(/([0-9.]+)\s*분/);
  return m ? parseInt(m[1], 10) : 300;
};

const parseMessage = (s) => {
  if (s === '기본제공') return 9999;
  const m = s.match(/([0-9.]+)\s*건/);
  return m ? parseInt(m[1], 10) : 0;
};

const esc = (s) => (s ? s.replace(/'/g, "''") : '');
const j = (v) => JSON.stringify(v).replace(/'/g, "''");

const lines = [
  '-- plans seed data from supabase/functions/_shared/data/plans.json',
  'TRUNCATE TABLE public.plans RESTART IDENTITY CASCADE;',
];

for (const p of plans) {
  const benefits = p.benefits ? `${j(p.benefits)}::jsonb` : "'[]'::jsonb";
  const vals = [
    p.id,
    `'${esc(p.name)}'`,
    "'LG U+'",
    `'${esc(p.category)}'`,
    `'${esc(p.target_age)}'`,
    `'${esc(p.data_tier)}'`,
    p.monthly_fee,
    `'${esc(p.data)}'`,
    parseData(p.data),
    p.data_speed_after ? `'${esc(p.data_speed_after)}'` : 'NULL',
    `'${esc(p.voice)}'`,
    parseVoice(p.voice),
    `'${esc(p.message)}'`,
    parseMessage(p.message),
    p.share_data ? `'${esc(p.share_data)}'` : 'NULL',
    p.tethering ? `'${esc(p.tethering)}'` : 'NULL',
    p.notes ? `'${esc(p.notes)}'` : 'NULL',
    benefits,
    "'[]'::jsonb",
    "'[]'::jsonb",
    'NULL',
    'true',
    p.id,
  ];
  lines.push(
    'INSERT INTO public.plans (id, name, carrier, category, target_age, data_tier, monthly_fee, data, data_amount_gb, data_speed_after, voice, call_amount_min, message, sms_amount, share_data, tethering, notes, benefits, ott_benefits, add_ons, contract_period_months, is_active, sort_order) VALUES (' +
      vals.join(', ') +
      ');',
  );
}

fs.writeFileSync(
  path.join(__dirname, '..', 'supabase', 'seed.sql'),
  lines.join('\n'),
);
console.log('seed.sql generated with ' + plans.length + ' plans');
