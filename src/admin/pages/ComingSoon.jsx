import PageHeader from '../components/PageHeader.jsx';

export default function ComingSoon({ title }) {
  return (
    <div>
      <PageHeader title={title} />
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-sm text-slate-500">
        This screen is being built in the next phase of the CMS rollout.
      </div>
    </div>
  );
}
