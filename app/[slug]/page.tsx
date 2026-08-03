import { DocsPage, docSlugs } from "../docs";

export function generateStaticParams() {
  return docSlugs.map((slug) => ({ slug }));
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return <DocsPage slug={slug} />;
}
