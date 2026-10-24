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

This Sticky Notes app is a single page app with one main component called [_**StickyArea.tsx**_](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/stickyArea/StickyArea.tsx). This component store the list of notes, which get mapped into [_**StickyNote.tsx**_](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/stickyNote/StickyNote.tsx) components. Each note contains a text area to take and display note content. [_**StickyArea.tsx**_](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/stickyArea/StickyArea.tsx) also store a reference to [_**TrashArea.tsx**_](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/trashArea/TrashArea.tsx), so the app can identify when cursor enters the element. The components are stored in its own folder and the common functionalities are extracted to a [_**util.ts**_](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/utils/utils.tsx) file, do reduce duplication and keep less code in one file. Each component's props and other interfaces are stored in [_**componentProps.ts**_](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/interfaces/componentProps.ts) to reduce duplication, keep single source of truth for easy-access, and allow for easy inheritance.

### Actions and Priority

Each note can have 4 status. **Idle** by default. **Creating** begins when the on _onPointerDown_ happens on an empty space, which will create a visible note when the mouse is drag beyond a certain threshold, then let go. Additionally, Moving begins when _onPointerDown_ happens inside a note. **Resizing** is a bit tricky, a border is added so the user knows where to click. In Order to determine the action priority, the app is coded to look for the action that requires the smallest most specific area first, then expand out. Starting with **Creating** (no overlap since it only looks for blank space), then follow by **Resizing** and **Moving** ([_**StickyArea.tsx**_ line 197](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/stickyArea/StickyArea.tsx#L197)). Note that there is an edge case where clicking on overlapping note will resized the one behind if the mouse position is in the middle of the top note, and the border of another note. To fix this, a condition is added to ignore **Resizing** if the **Moving** note is on top ([_**StickyArea.tsx**_ line 249](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/stickyArea/StickyArea.tsx#L249)). Also note that only one note can move/update at a time, so the active note is stored in _focusNote_ ([_**StickyArea.tsx**_ line 37](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/stickyArea/StickyArea.tsx#L37))

### Note Vertical Order

To record the render order of each note, an id is assigned to each which is generated using current timestamps ([_**StickyArea.tsx**_ line 61](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/stickyArea/StickyArea.tsx#L61)). Each note is also sorted when its added to the list _addNote_ and _sortNote_. Which means that the latest note will always render on top. This solution is the least complex, as keeping the z position can generate bugs. Moreover in order to bring a note to the top, a note's id gets updated every time the note is **Moving** or **Resizing** ([_**StickyArea.tsx**_ line 249](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/stickyArea/StickyArea.tsx#L249)).

### Note X and Y position

A note is simply a rectangle from point A to point B. Thus the position is recorded in the start/stop element of each note. ([_**StickyArea.tsx**_ line 63](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/stickyArea/StickyArea.tsx#L63)) ([_**StickyArea.tsx**_ line 142](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/stickyArea/StickyArea.tsx#L142)). **Creating** and **Resizing** is quite identical, because only the stop position is moved with the mouse. **Moving** is a lot more complex as the distance between the note and mouse must remain the same. The offset from start to mouse is calculated when mouse down ([_**StickyArea.tsx**_ line 79](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/stickyArea/StickyArea.tsx#L79)), then the new start/stop is calculated by 1.getting distance between start stop, 2.calculate new start by combining offset and mouse, 3. calculate new stop by combining start and start/stop distance. ([_**StickyArea.tsx**_ line 114](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/stickyArea/StickyArea.tsx#L114))

### Trash

A ref of trash area is kept in [_**StickyArea.tsx**_](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/stickyArea/StickyArea.tsx), so if the current action is **Moving**, and the mouse is let go when the position is in the trash, then the note is removed from list ([_**StickyArea.tsx**_ line 147](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/stickyArea/StickyArea.tsx#L147)). Note that the border of Trash component is dotted lines, and dragging a note into trash will change the note's border to dots too. This is a quick visual indicator for user to know if their note will be deleted or not ([_**StickyNote.tsx**_ line 13](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/stickyNote/StickyNote.tsx#L13)).

### Editing note's text

There is a text area inside each note. And the text is stored in the Note list ([_**StickyArea.tsx**_ line 32](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/stickyArea/StickyArea.tsx#L32)) so each note get re-generated with text when moving, resized, or page refresh. Im aware that the note gets re-rendered at every interaction which is super wasteful.

### LocalStorage Saving

Since each note can be easily converted/parsed. Storing it in localStorage requires minimal changes ([_**StickyArea.tsx**_ line 46](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/stickyArea/StickyArea.tsx#L46)) ([_**StickyArea.tsx**_ line 34](https://github.com/guychuasaard/Tempo_StickyNotes/blob/bb6507e6a0b92afedac3f1c5c9a8d9ae43e839cb/tempo-stickynotes/src/components/stickyArea/StickyArea.tsx#L34)).

## Design Decision

- Keeping 2 edges instead of one centre point for each note: It requires less calculation as keeping centre point would require calculating top/left/right/bottom from note width/heigh. And moving would require another later of calculation (distance between mouse and centre + top right and bottom left). Also more calculation on decimal point will cause it to be less accurate (experience from Unity3D game engine).
- Using timestamps instead of Z index: keeping index would cause complication when removing note, as other z index gets calculated. Which add more code for no reason.
- Dotted line when delete: At first I want to turn the note red, but that means red wouldn't be an option for note color.
- No Transform: I plan to use transform when dragging, as it will reduce the number of render. The issue is transform require you to add ref to each note, which add a layer of complexity. I asked Ai to show how the code base look like, and I feel like implementing transform would take time away from the 4 objectives, which should be the main focus. Hence I skipped it.
