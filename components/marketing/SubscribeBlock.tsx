import { SITE } from '@/lib/site';
import styles from './SubscribeBlock.module.scss';

export function SubscribeBlock() {
  const action = `https://buttondown.com/api/emails/embed-subscribe/${SITE.buttondownUsername}`;
  return (
    <section className={styles.root}>
      <div className={styles.card}>
        <div className={styles.l}>
          <div className={styles.k}>Newsletter · once a month</div>
          <h3>New posts, delivered slowly.</h3>
          <p>
            One email per new post — usually once a month. No tracking, no &ldquo;content&rdquo;, no
            upsell. Unsubscribe lives at the top of every message.
          </p>
          <form action={action} method="post" target="popupwindow">
            <input type="email" name="email" placeholder="you@domain.tld" required />
            <input type="hidden" name="embed" value="1" />
            <button type="submit">subscribe →</button>
          </form>
          <div className={styles.tiny}>
            Currently {SITE.status.subscribers.toLocaleString()} readers · powered by Buttondown
          </div>
        </div>

        <div className={styles.r}>
          <div className={styles.k}>Or follow however you prefer</div>
          <div className={styles.lg}>cat /follow/mamoc</div>
          <div className={styles.opts}>
            <a className={styles.opt} href={SITE.social.rss}>
              <div className={styles.ic}>R</div>
              <div>
                <div className={styles.t}>RSS</div>
                <div className={styles.s}>{SITE.social.rss} · the original subscribe</div>
              </div>
              <div className={styles.arr} aria-hidden="true">↗</div>
            </a>
            <a className={styles.opt} href={SITE.social.atom}>
              <div className={styles.ic}>A</div>
              <div>
                <div className={styles.t}>Atom</div>
                <div className={styles.s}>{SITE.social.atom}</div>
              </div>
              <div className={styles.arr} aria-hidden="true">↗</div>
            </a>
            <a className={styles.opt} href={SITE.social.json}>
              <div className={styles.ic}>{'{}'}</div>
              <div>
                <div className={styles.t}>JSON feed</div>
                <div className={styles.s}>{SITE.social.json} · for scripts</div>
              </div>
              <div className={styles.arr} aria-hidden="true">↗</div>
            </a>
            <a className={styles.opt} href={SITE.social.github} target="_blank" rel="noreferrer">
              <div className={styles.ic}>G</div>
              <div>
                <div className={styles.t}>GitHub</div>
                <div className={styles.s}>star the repo — new posts arrive as commits</div>
              </div>
              <div className={styles.arr} aria-hidden="true">↗</div>
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
