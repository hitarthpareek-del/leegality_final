export default function SearchBar({
  search,
  setSearch,
}) {
  return (
    <div className="input-group">

      <span className="input-group-text">
        <i className="bi bi-search"></i>
      </span>

      <input
        type="text"
        className="form-control"
        placeholder="Search by email or status..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

    </div>
  );
}