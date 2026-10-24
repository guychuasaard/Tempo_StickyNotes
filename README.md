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
Each note can have 4 status. **Idle** by default. **Creating** begins when the on *onPointerDown* happens on an empty space, which will create a visible note when the mouse is drag beyond a certain threshold, then let go. Additionally, Moving begins when *onPointerDown* happens inside a note. **Resizing** is a bit tricky, a border is added so the user knows where to click. In Order to determine the action priority, the app is coded to look for the action that requires the smallest most specific area first, then expand out. Starting with **Creating** (no overlap since it only looks for blank space), then follow by **Resizing** and **Moving** (***StickyArea.tsx*** line 197). Note that there is an edge case where clicking on overlapping note will resized the one behind if the mouse position is in the middle of the top note, and the border of another note. To fix this, a condition is added to ignore **Resizing** if the **Moving** note is on top (***StickyArea.tsx*** line 249). Also note that only one note can move/update at a time, so the active note is stored in *focusNote* (***StickyArea.tsx*** line 37)


### Note Vertical Order
To record the render order of each note, an id is assigned to each which is generated using current timestamps (***StickyArea.tsx*** line 61). Each note is also sorted when its added to the list *addNote* and *sortNote*. Which means that the latest note will always render on top. This solution is the least complex, as keeping the z position can generate bugs. Moreover in order to bring a note to the top, a note's id gets updated every time the note is **Moving** or **Resizing** (***StickyArea.tsx*** line 249).

### Note X and Y position
A note is simply a rectangle from point A to point B. Thus the position is recorded in the start/stop element of each note. (***StickyArea.tsx*** line 63) (***StickyArea.tsx*** line 142). **Creating** and **Resizing** is quite identical, because only the stop position is moved with the mouse. **Moving** is a lot more complex as the distance between the note and mouse must remain the same. The offset from start to mouse is calculated when mouse down (***StickyArea.tsx*** line 79), then the new start/stop is calculated by 1.getting distance between start stop, 2.calculate new start by combining offset and mouse, 3. calculate new stop by combining start and start/stop distance. (***StickyArea.tsx*** line 114)

### Trash
A ref of trash area is kept in ***StickyArea.tsx***, so if the current action is **Moving**, and the mouse is let go when the position is in the trash, then the note is removed from list (***StickyArea.tsx*** line 147). Note that the border of Trash component is dotted lines, and dragging a note into trash will change the note's border to dots too. This is a quick visual indicator for user to know if their note will be deleted or not (***StickyNote.tsx*** line 13).

### Editing note's text
There is a text area inside each note. And the text is stored in the Note list (***StickyArea.tsx*** line 32) so each note get re-generated with text when moving, resized, or page refresh. Im aware that the note gets re-rendered at every interaction which is super wasteful.

### LocalStorage Saving
Since each note can be easily converted/parsed. Storing it in localStorage requires minimal changes (***StickyArea.tsx*** line 46) (***StickyArea.tsx*** line 34).








