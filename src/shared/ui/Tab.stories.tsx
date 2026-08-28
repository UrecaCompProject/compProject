import { useState } from 'react';

import Tab from './Tab';

export default {
  title: 'shared/Tab',
  component: Tab,
};

const periodOptions = [
  { label: '3개월', value: '3' },
  { label: '6개월', value: '6' },
  { label: '12개월', value: '12' },
] as const;

export function Default() {
  const [value, setValue] = useState<'3' | '6' | '12'>('3');

  return <Tab options={periodOptions} value={value} onChange={setValue} />;
}
