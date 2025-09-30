<?php

namespace App\Traits;

trait ModelTrait
{
    /**
     * Scope a query to filter results based on a search term across specific fields,
     * including raw SQL expressions.
     *
     * This scope applies a LIKE search on the specified standard fields and raw SQL
     * expressions. For raw SQL expressions, ensure they are properly constructed
     * in your query's select statement.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param string|null $search The search term to filter by.
     * @param array|null $fields An array of standard database column names to apply the search to.
     * Defaults to the model's `$searchable` property if not provided.
     * @param array $rawFields An array of raw SQL expressions (as strings) to apply the search to.
     * Ensure these expressions are valid and will return a searchable value.
     * Use with caution to avoid potential SQL injection if not carefully managed.
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSearch($query, $search, $fields = null, $rawFields = [])
    {
        // Default to using the model's searchable fields if not provided
        $fields = is_array($fields) ? $fields : ($this->searchable ?? []);

        // Return the query as is if no fields are specified or no search term is provided
        if (!is_array($fields) || empty($fields) || empty($search)) {
            return $query;
        }

        return $query->where(function ($query) use ($search, $fields, $rawFields) {
            // Apply a LIKE condition to each standard field
            foreach ($fields as $field) {
                // Ensure the field is a valid string to prevent SQL injection
                if (is_string($field) && !empty($field)) {
                    $query->orWhere($field, 'LIKE', "%{$search}%");
                }
            }

            // Apply a LIKE condition to each raw SQL expression
            foreach ($rawFields as $rawField) {
                // Ensure the raw field is a valid string to prevent SQL injection
                if (is_string($rawField) && !empty($rawField)) {
                    $query->orWhereRaw("{$rawField} LIKE ?", ["%{$search}%"]);
                }
            }
        });
    }

    /**
     * Scope a query to sort the results based on a specified field and order.
     *
     * This scope adds ordering by the given sort field and order.
     * It defaults to ordering by 'id' in descending order.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeSortable($query, $request)
    {
        // Use 'id' as the default sort field and 'desc' as the default sort order
        $field = $request->sort_field ?? 'id';
        $order = $request->sort_order ?? 'desc';

        // Check if sort parameters are valid
        $invalidValues = ['undefined', 'null', ''];

        if (!in_array($field, $invalidValues) && !in_array($order, $invalidValues)) {
            $query->orderBy($field, $order);
        } else {
            // If the sort parameters are invalid, default to ordering by 'id'
            $query->orderBy('id', 'desc');
        }

        return $query;
    }

    /**
     * Scope a query to paginate the results based on the provided page size.
     *
     * This scope handles pagination by either applying a limit and paginating
     * or returning all results if no page size is specified.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param \Illuminate\Http\Request $request
     * @return \Illuminate\Contracts\Pagination\LengthAwarePaginator|\Illuminate\Database\Eloquent\Collection
     */
    public function scopePagination($query, $request)
    {
        // Check if the request specifies a page size and paginate
        if (!empty($request->page_size)) {
            return $query
                ->paginate($request->page_size, ['*'], 'page', $request->page ?? 1)
                ->toArray();
        }

        // Return all results if no page size is provided
        return $query->get();
    }

    /**
     * Scope a query to filter results based on the trash status (trashed or not).
     *
     * This scope adds a filter to return only trashed records, only non-trashed records,
     * or all records if no state is provided.
     *
     * @param \Illuminate\Database\Eloquent\Builder $query
     * @param bool|null $isTrash Whether to filter by trashed state (true = trashed, false = not trashed).
     * @return \Illuminate\Database\Eloquent\Builder
     */
    public function scopeTrashState($query, $isTrash = null)
    {
        // If no trash state is provided, return all records (no filtering)
        if (is_null($isTrash)) {
            return $query;
        }

        // Apply the trash filter based on the given state (trashed or not)
        return $isTrash ? $query->onlyTrashed() : $query->withoutTrashed();
    }
}