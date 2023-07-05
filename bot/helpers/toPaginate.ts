export default (totalCount: number, pageIndex: number, pageSize: number, items: Array<any>) => ({
  total_count: totalCount,
  page_index: pageIndex,
  page_size: pageSize,
  has_next_page: totalCount > pageIndex * pageSize,
  total_pages: Math.ceil(totalCount / pageSize),
  items
})
