export default function DashboardLoading() {
  return (
    <div className="page-stack" aria-busy="true" aria-label="Memuat halaman">
      <div className="skeleton heading" />
      <div className="card-grid three">
        <div className="skeleton card-skeleton" />
        <div className="skeleton card-skeleton" />
        <div className="skeleton card-skeleton" />
      </div>
    </div>
  );
}
