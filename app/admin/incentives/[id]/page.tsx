import EditIncentiveForm from './EditIncentiveForm';

/** 静的エクスポート用（GitHub Pages）。1件だけ生成してビルドを通す */
export function generateStaticParams() {
  return [{ id: '_' }];
}

export const dynamicParams = true;

export default function EditIncentiveCampaignPage() {
  return <EditIncentiveForm />;
}
