import { Link } from 'react-router-dom';
import styles from './Sitemap.module.scss';

const Sitemap = () => {
  const siteStructure = [
    {
      title: 'Main Pages',
      links: [
        { path: '/', label: 'Dashboard', description: 'Funds Console overview with payouts and statistics' },
        { path: '/about', label: 'About', description: 'Information about the Fanvue Funds Console' },
      ],
    },
    {
      title: 'Resources',
      links: [
        { path: '/sitemap', label: 'Sitemap', description: 'Site structure and navigation' },
      ],
    },
  ];

  return (
    <main className={styles.sitemap}>
      <h1 className={styles.title}>Sitemap</h1>
      <p className={styles.description}>
        Complete overview of all pages available in the Fanvue Funds Console.
      </p>

      <div className={styles.sections}>
        {siteStructure.map((section) => (
          <section key={section.title} className={styles.section}>
            <h2 className={styles.sectionTitle}>{section.title}</h2>
            <ul className={styles.linkList}>
              {section.links.map((link) => (
                <li key={link.path} className={styles.linkItem}>
                  <Link to={link.path} className={styles.link}>
                    <span className={styles.linkLabel}>{link.label}</span>
                    <span className={styles.linkPath}>{link.path}</span>
                  </Link>
                  <p className={styles.linkDescription}>{link.description}</p>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </main>
  );
};

export default Sitemap;
