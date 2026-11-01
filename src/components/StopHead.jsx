/** Every section starts as a stop: the line enters from the page edge and ends in a ring at the title. */
export default function StopHead({ id, children }) {
  return (
    <h2 id={id} className="stop-head">
      <span aria-hidden="true" className="stop-ring" />
      {children}
    </h2>
  )
}
