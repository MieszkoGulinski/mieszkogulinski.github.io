---
layout: post.liquid
pageTitle: Introduction to indexes in SQL databases
date: 2024-03-08
tags: posts
pageDescription: A short introduction to indexes in SQL databases, mostly concentrating on PostgreSQL and SQLite.
---

This article is a short introduction to indexes in SQL databases, mostly concentrating on PostgreSQL and SQLite.

## Why do we need indexes?

An [index](https://en.wikipedia.org/wiki/Database_index) in a SQL database is an additional data structure that makes searching for entries in a table faster.

Adding an index to a database column makes **filtering** (in `WHERE` condition) and **joining** on that column faster. For example, when we want to read an entry with a given ID, having the ID column indexed makes the database engine to look for the entry in the index, and then read the entry from the table. This is faster than performing a sequential scan - reading the whole table and then looking for the entry.

Although adding an index to a column makes filtering an joining on that column faster, it also needs to be updated when performing insert, update and delete operations, making them slower. Also, an index takes up space on the disk and in RAM. That's why the index should be used **only** on the columns that are used in filtering and joining operations.

Also, adding an index also doesn't speed up reading from the database:
- when the column is included only in the list of returned columns (SELECT clause), but not in WHERE or JOIN clauses
- when the table is small, and the database engine can perform a sequential scan faster than using the index - but the database engine should be able to figure this out by itself, so there's no use in removing the index in such cases

## Where do we need indexes?

[The basic rule of thumb](https://dba.stackexchange.com/questions/31514/how-do-i-know-what-indexes-to-create-for-a-table) is to add an index on:
- primary key (PostgreSQL automatically adds an index to the primary key column)
- foreign keys
- other columns that are used in `WHERE` operations
- other columns that are used in `JOIN` operations

This does not need to apply to queries done only once, or very rarely. Also, these are only rules of thumb, and to obtain the best performance, it's necessary to measure the performance of the  queries, and to add or remove indexes as necessary.

Still, these rules of thumb are a good starting point, and if the database does not fulfill these rules, it's typically necessary to apply them as soon as possible. After that, performing more optimizations related to indexing will be worth it only when performance problems arise.

## Performing calculations in WHERE columns

If an indexed column is used in a calculation, the index cannot be used.

In the simplest example, if we have a column `a` and an index on it, and we want to filter the entries where `a + 1 = 2`, the index cannot be used. In this particular case, it's better to perform the calculation on the right side of the equation, and write the condition as `a = 2 - 1`. This particular case can be rewritten as `a = 1`, but there are cases where such simplification is not possible, for example, when using a function such as the current time. In this case, we should include the function in the right side of the equation.

An expression that can be efficiently used in the left side of the equation [is called a **sargable** expression](https://en.wikipedia.org/wiki/Sargable) (abbreviation for "search argument able").

Some database engines (at least [PostgreSQL](https://www.postgresql.org/docs/current/indexes-expressional.html) and [SQLite](https://www.sqlite.org/lang_createindex.html)) support indexes on expressions, which can be used in such cases.

### Automatic index creation

Database engines can automatically add an index to a column, but the rules for this are different for different DBMS. For example, PostgreSQL automatically adds an index to the primary key column, and the columns marked UNIQUE. It's necessary to check the documentation of the DBMS used.

Also, database ORMs may or may not automatically add indexes to foreign keys. That's why it's necessary to check the documentation of the ORM used, and explicitly mark a column as indexed where necessary.

### What indexes are already added to a table?

In PostgreSQL, to check if a column in a given table is already indexed, in the `psql` CLI, use `\d table_name` command to obtain information about a table. List of indexes will be shown below the list of columns.

In SQLite, in the `sqlite3` CLI:
- use `.indexes` command to obtain a list of index names
- use `.schema table_name` to obtain complete table information, including indexes, for a given table.
- perform `SELECT * FROM sqlite_master WHERE type = 'index';` query to obtain a list of indexes and their definitions

## SQL syntax for adding and removing an index

If you write SQL queries directly, you can use the following syntax:

```sql
CREATE INDEX index_name ON table_name (column_name);
```

If you use an ORM, it should have a method for adding an index to a column. Refer to the documentation of the ORM used.

To remove an index, use the following syntax:

```sql
DROP INDEX index_name;
```

For more advanced cases, such as adding an index to a multi-column key, refer to the documentation of the DBMS used.

## Special types of indexes, by what is indexed

Typically, the index is added to a single column. At least PostgreSQL and SQLite support more complex cases, such as:
- multi-column indexes, used for conditions like `WHERE a = 1 AND b = 2`, including composite primary keys
- partial indexes, used for conditions like `WHERE a = 1` in a table with a lot of entries where `a` is usually not 1
- index on expression, used for conditions like `WHERE a + b = 1`

## Special types of indexes, by how the index is implemented

Typically, the index is internally implemented as a [B-tree](https://use-the-index-luke.com/sql/anatomy/the-tree), which is an efficient data structure for searching ordered entries. Such indexes are useful for range queries, such as `WHERE a > 1 AND a < 3`. In PostgreSQL, the B-tree index is the default index type.

For more specialized purposes, there are other types of indexes. Because this is an advanced topic, look up the DBMS documentation for details about them, for example [list of available index types in PostgreSQL](https://www.postgresql.org/docs/current/indexes-types.html). Some of the options are:
- hash index, used for equality comparisons, such as `WHERE a = 1`
- full-text search index (but if your application makes heavy use of full text search, consider using a specialized search engine, such as Elasticsearch, for this purpose)

In SQLite, the index type [is not specified when adding an index](https://www.sqlite.org/lang_createindex.html). Special types of indexes, such as [full text search](https://www.sqlite.org/fts5.html), are supported using [virtual tables](https://www.sqlite.org/vtab.html) mechanism.

### Checking the type of an index

In PostgreSQL, checking the type of an index is possible with `\d table_name` command in `psql` CLI, for example:

```
Indexes:
    "code_receipts_pkey" PRIMARY KEY, btree (id)
```

The `btree` in the output above means that the index is implemented as a B-tree, `code_receipts_pkey` is the name of the index, and `id` is the name of the column.

## Advanced optimization

Following the rules given in "Where do we need indexes?" and "Performing calculations in WHERE columns" sections should be enough for a small to mid-sized application. But when the application grows, and performance problems arise, it becomes necessary to perform more advanced optimizations. Articles about these methods will come up in the future.

Database engines provide tools that can be used to identify bottlenecks in a given query, so experimenting with indexes and queries manually doesn't need to be necessary.

### Using EXPLAIN to check if the index is needed

In PostgreSQL, the `EXPLAIN` command can be used to check what internal operations are going to be used in a given query, and estimate the runtime of that query. The documentation of this command is available [here](https://www.postgresql.org/docs/current/using-explain.html). In SQLite, the `EXPLAIN QUERY PLAN` command is available for this purpose, and the documentation is available [here](https://www.sqlite.org/eqp.html).

A related PostgreSQL command `EXPLAIN ANALYZE` actually performs the query, and then shows the output of the `EXPLAIN` command not based on estimations, but on the measured runtime of the query.

`EXPLAIN` command can be used to check if an index could help for the given query to be more efficient, but interpreting the output of the `EXPLAIN` command is an advanced topic, and will be described in a separate article.

## Further reading

This article is a basic introduction to indexes in SQL databases. For more advanced topics, see the following resources:

- https://use-the-index-luke.com/ - a website about indexing in SQL databases, with a lot of examples and explanations
- https://www.postgresql.org/docs/current/indexes.html - PostgreSQL documentation about indexes
- https://explain.depesz.com/ - a tool for visualizing the output of the `EXPLAIN` command in PostgreSQL
