type PaginationProps = {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
};

function Pagination({
  currentPage,
  totalPages,
  onPageChange,
}: PaginationProps) {
  return (
    <>
      <nav
        className="flex items-center gap-x-1 bg-[#06051d] p-2 rounded-full border-solid border-2 border-[#06051d]"
        style={{ border: "1px solid rgba(229, 229, 229, 0.1)" }}
      >
        <button
          type="button"
          className="btn btn-text btn-square"
          aria-label="Previous Button"
          disabled={currentPage === 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          <span className="icon-[tabler--chevron-left] size-5 rtl:rotate-180"></span>
        </button>
        <div className="flex items-center gap-x-1">
          <button
            type="button"
            className="btn btn-text btn-square pointer-events-none"
            aria-current="page"
          >
            {currentPage}
          </button>
          <span className="text-base-content/80 mx-3">of</span>
          <button
            type="button"
            className="btn btn-text btn-square pointer-events-none"
          >
            {totalPages}
          </button>
        </div>
        <button
          type="button"
          className="btn btn-text btn-square"
          aria-label="Next Button"
          disabled={currentPage === totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          <span className="icon-[tabler--chevron-right] size-5 rtl:rotate-180"></span>
        </button>
      </nav>
    </>
  );
}

export default Pagination;
