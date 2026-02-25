/** 静的エクスポート用（GitHub Pages）。1件だけ生成し [id] 配下のルートを通す */
export function generateStaticParams() {
  return [{ id: '_' }];
}

export const dynamicParams = true;

export default function Layout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
