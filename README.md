# Sticky Notes

# Getting Started 

    npm install
    npm run dev

## Features
Core:
- [x] Create a note at a chosen position and size
- [x] Resize by dragging
- [x] Move by dragging
- [x] Delete by dropping on the trash zone

Bonus:
- [x] Edit note text (There is a bug where the app doesn't quite focus on textarea. You need to drag or resize first.)
- [x] Bring to front on interaction
- [x] Persist to localStorage
- [ ] Note colours
- [ ] REST API (async mock)

## Architecture
This Sticky Notes app is a single page app with one main component called ***StickyArea.tsx***. This component store the list of notes, which get mapped into ***StickyNote.tsx*** components. Each note contains a text area to take and display note content. ***StickyArea.tsx*** also store a reference to ***TrashArea.tsx***, so the app can identify when cursor enters the element. The components are stored in its own folder and the common functionalities are extracted to a ***util.ts*** file, do reduce duplication and keep less code in one file. Each component's props and other interfaces are stored in ***componentProps.ts*** to reduce duplication, keep single source of truth for easy-access, and allow for easy inheritance.

### Actions and Priority
Each note can have 4 steps. **Idle** by default. **Creating** begins when the on *onPointerDown* happens on an empty space, which will create a visible note when the mouse is drag beyond a certain threshold, then let go. Additionally, Moving begins when *onPointerDown* happens inside a note. The app only query the top note, then calculate the distance between a corner of the note and the mouse (***StickyArea.tsx*** line 79), so that the note position can remain at the same distance to mouse while being dragged. **Resizing** is a bit tricky, a border is added so the user know where to click. To determine the action priority, the app is coded to look for the actions that require the smallest most specific area first, then expand out. Start with **Creating** (no overlap since it only look for blank space), then follow by **Resizing** and **Moving** (***StickyArea.tsx*** line 197). Note that there is an edge case where clicking on overlapping note will resized the one behind if the mouse position is in the middle of the top note, and the border of another note. To fix this, a condition is added to ignore **Resizing** if the **Moving** note is on top (***StickyArea.tsx*** line 249).


### Note Vertical Order
To keep the render order of each note, an id is assigned to each which is generated using current timestamps (***StickyArea.tsx*** line 61). Each note is also sorted when its added to the list *addNote* and *sortNote*. Which means that the latest note will always render on top. This solution is the least complex, as keeping the z position can generate bugs. And in order to bring a note to the top, a note's id gets updated everytime the note moves or resized (***StickyArea.tsx*** line 249).


