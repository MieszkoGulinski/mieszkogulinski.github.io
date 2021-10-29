---
layout: post.liquid
pageTitle: Pathfinding algorithm in a puzzle game
date: 2021-10-14
tags: posts
---

In [this puzzle game](https://mieszkogulinski.github.io/react-kulki/), the player has to move colorful balls on a grid. When there are 5 (or more) balls of the same color in a row (horizontally, vertically, diagonally), the series disappears and the player is awarded some score. After a move that doesn't result in a disappearing series, 3 more balls (in random location, in random color) appear on the board. The balls can be moved only when there's a clear path from one location to another - from one grid to another, they can move up, down, left or right.

One of the original implementations of this game was made for Windows 3.1, so it doesn't work on modern computers anymore. That's why I created a clone of this logic game, written in JavaScript and HTML, with [React](https://reactjs.org/). Feel free to play it in your free time!

## How does the pathfinding algorithm work?

When the player selects a **start** and **end** grid cell, we generate a **spanning tree** of all possible moves from the start cell, and then we follow the path from the end cell to the start cell.

### What is a spanning tree?

At first, let's interpret the game grid as a graph, where each non-occupied cell is a vertex of a graph, and the edges of the graph are possible path of movement between adjacent cells.

Here's a graph of possible movements on an empty grid:

![Alt text](/img/pathfinding-1.svg)

A spanning tree is a tree graph that covers all vertices of connected graph. Usually there can be multiple spanning trees of a given graph, but we need to generate only one, and it doesn't really matter for the game rules what this spanning tree is. A tree graph has a property that, between two selected vertices, there's **only one unique path**. That's why creating a spanning tree is useful for creating a path for a ball to another available cell.

Here's an example spanning tree of an empty grid:

![Alt text](/img/pathfinding-2.svg)

This tree has a root in the top left corner, but its root can be moved to any of its vertices and it'll still be a spanning tree of the graph.

A spanning tree of a board, but with several balls blocking path to the bottom right corner, could look like that:

![Alt text](/img/pathfinding-3.svg)

### Tree generation algorithm

The algorithm used in the puzzle game is:
1. Start with the starting point
2. In each iteration, from each cell added in previous iteration (or the starting point), find possible paths from this point to another cell. Keep track of added cells for avoiding duplicates.
3. If no new paths are added in a next iteration, building a spanning tree is finished.

In the implementation of the algorithm, the cells are numbered from 0 to 80, and list of paths from one cell to another, is kept in an object, in format:
```
{ sourceCell: [targetCell1, targetCell2], ...}
```
For example, if we can make a move from cell 0 to cell 1 and 9, the object will have format:
```
{ 0: [1, 9], ... }
```

For example, let's assume that we want to calculate paths from the top right corner. In the first iteration, starting from the starting point, we can go one right and one bottom:

![Alt text](/img/pathfinding-4.svg)

The code checks that a potential next cell is a valid cell (so we can't go outside the field), is not occupied by a ball, and hasn't been added to the tree yet. In the second iteration, we find the following fields connected to the previously added ones:

![Alt text](/img/pathfinding-5.svg)

And in the next iteration:

![Alt text](/img/pathfinding-6.svg)

When we find the target cell, we don't need to continue the algorithm, because the path from start to end cell will already be covered with the spanning tree. But if we create a spanning tree and don't find the target cell, it means that there is no path between selected cells, and the player cannot make such a move.

When the tree contains both the start and end cells, and the start cell is at the root, we can find the cells on every step from the end towards the root, and then reverse the array.
