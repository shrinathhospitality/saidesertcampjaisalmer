import { useParams } from 'react-router-dom';
import { FaFacebookF, FaLinkedinIn } from 'react-icons/fa';
import { FaXTwitter } from 'react-icons/fa6';
import Page from '../components/Page.jsx';
import SEO from '../seo/SEO.jsx';
import PageHero from '../components/PageHero.jsx';
import BlogCard from '../components/cards/BlogCard.jsx';
import CTA from '../components/CTA.jsx';
import { useContent } from '../context/ContentContext.jsx';
import { bySlug, pageUrl } from '../utils/format';
import { blogSchema, breadcrumbSchema } from '../seo/schema.js';

export default function BlogDetails() {
  const { slug } = useParams();
  const { blogs, settings } = useContent();
  const post = bySlug(blogs, slug) || blogs[0];
  const related = blogs.filter((item) => item.id !== post.id).slice(0, 3);
  const crumbs = [{ name: 'Home', url: '/' }, { name: 'Blog', url: '/blog' }, { name: post.title, url: `/blog/${post.slug}` }];
  const shareUrl = pageUrl(settings.baseUrl, `/blog/${post.slug}`);

  const shareLinks = [
    { Icon: FaFacebookF, href: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}` },
    { Icon: FaXTwitter, href: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(post.title)}` },
    { Icon: FaLinkedinIn, href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}` },
  ];

  return (
    <Page>
      <SEO title={post.title} description={post.excerpt} path={`/blog/${post.slug}`} image={post.image} schemas={[blogSchema(post, settings), breadcrumbSchema(crumbs)]} type="article" />
      <PageHero eyebrow={post.category} title={post.title} text={post.excerpt} image={post.image} breadcrumbs={[{ label: 'Blog', path: '/blog' }, { label: post.title }]} />
      <article className="section-pad">
        <div className="container-lux max-w-4xl">
          <p className="text-xs font-bold uppercase tracking-[.28em] text-bronze">{post.author} · {new Date(post.date).toLocaleDateString()}</p>
          <div
            className="prose mt-8 max-w-none text-lg leading-9 text-ink/70 [&_a]:text-bronze [&_a]:underline [&_blockquote]:border-l-2 [&_blockquote]:border-ink/15 [&_blockquote]:pl-5 [&_blockquote]:italic [&_h2]:font-display [&_h2]:text-4xl [&_h3]:font-display [&_h3]:text-3xl [&_p]:mb-6"
            dangerouslySetInnerHTML={{ __html: post.contentHtml || (post.content || []).map((p) => `<p>${p}</p>`).join('') }}
          />
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="text-xs font-bold uppercase tracking-[.28em] text-ink/50">Share</span>
            {shareLinks.map(({ Icon, href }, index) => (
              <a key={index} href={href} target="_blank" rel="noopener noreferrer" className="grid h-11 w-11 place-items-center rounded-full border border-ink/10 text-bronze transition hover:border-champagne">
                <Icon />
              </a>
            ))}
          </div>
        </div>
      </article>
      {related.length > 0 && (
        <section className="section-pad bg-[#ede2d0]">
          <div className="container-lux">
            <h2 className="mb-10 font-display text-6xl">Related Posts</h2>
            <div className="grid gap-6 lg:grid-cols-3">{related.map((item) => <BlogCard key={item.id} post={item} />)}</div>
          </div>
        </section>
      )}
      <section className="section-pad"><div className="container-lux"><CTA title="Continue the journey in person" /></div></section>
    </Page>
  );
}
