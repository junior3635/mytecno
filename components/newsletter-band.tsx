import SubscribeForm from '@/components/subscribe-form';

export default function NewsletterBand() {
  return (
    <section className="newsletter-band" aria-label="Newsletter">
      <div className="container newsletter-inner">
        <div className="newsletter-text">
          <h2 className="newsletter-title">Stay informed.</h2>
          <p className="newsletter-copy">
            The best stories from technology, food and culture delivered to your inbox,
            once a week.
          </p>
        </div>
        <SubscribeForm />
      </div>
    </section>
  );
}