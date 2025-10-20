// show boostrap-breakpoints
// for debugging purposes during development
export default function ShowBootstrapBreakPoints() {
  const points = ['xs', 'sm', 'md', 'lg', 'xl', 'xxl'];
  return <aside className="bootstrap-breakpoints">
    {points.map((size, i) => (
      <div key={i} className={
        (size === 'xs' ? 'd-block ' : 'd-none d-' + size + '-block ')
        + (points[i + 1] ? 'd-' + points[i + 1] + '-none' : '')
      }>
        {size}
      </div>
    ))}
  </aside>;
}