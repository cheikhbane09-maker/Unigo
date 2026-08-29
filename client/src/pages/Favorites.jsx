import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { get } from '../lib/api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { PageHeader } from '../components/Layout.jsx';
import UniversityCard from '../components/UniversityCard.jsx';
import Spinner, { EmptyState } from '../components/Spinner.jsx';

export default function Favorites() {
  const { t } = useI18n();
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    get('/favorites')
      .then((r) => setRows(r.data.filter((f) => f.university)))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <PageHeader title={t('fav.title')} />
      <div className="container-page py-10">
        {loading ? (
          <Spinner />
        ) : rows.length === 0 ? (
          <EmptyState
            title={t('fav.empty')}
            action={<Link to="/universites" className="btn-primary mt-4">{t('home.cta.explore')}</Link>}
          />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {rows.map((f) => (
              <UniversityCard key={f.id} university={f.university} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
