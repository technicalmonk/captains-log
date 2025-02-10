import React, { useState, useEffect } from 'react';
import { Note, NoteFilter, NoteSortOptions, NoteManagementService } from '../services/NoteManagementService';
import styles from './NoteManagementPanel.module.css';
import retroStyles from '../styles/RetroEffects.module.css';
import { GlitchEffect } from './GlitchEffect';

interface NoteManagementPanelProps {
  onNoteSelect?: (note: Note) => void;
}

export const NoteManagementPanel: React.FC<NoteManagementPanelProps> = ({ onNoteSelect }) => {
  const [noteService] = useState(() => new NoteManagementService());
  const [notes, setNotes] = useState<Note[]>([]);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);
  const [folders, setFolders] = useState<string[]>([]);
  const [tags, setTags] = useState<string[]>([]);
  const [filter, setFilter] = useState<NoteFilter>({});
  const [sort, setSort] = useState<NoteSortOptions>({ field: 'updatedAt', direction: 'desc' });
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [newTag, setNewTag] = useState('');
  const [newFolder, setNewFolder] = useState('');

  useEffect(() => {
    refreshNotes();
    setFolders(noteService.getFolders());
    setTags(noteService.getAllTags());
  }, [filter, sort]);

  const refreshNotes = () => {
    setNotes(noteService.getNotes(filter, sort));
  };

  const handleCreateNote = () => {
    if (!newNoteTitle.trim()) return;
    
    const note = noteService.createNote(newNoteTitle, [], [], filter.folder || 'Main Memory');
    setNewNoteTitle('');
    refreshNotes();
    setSelectedNote(note);
  };

  const handleDeleteNote = (id: string) => {
    noteService.deleteNote(id);
    if (selectedNote?.id === id) {
      setSelectedNote(null);
    }
    refreshNotes();
  };

  const handleUpdateNote = (note: Note, updates: Partial<Note>) => {
    const updatedNote = noteService.updateNote(note.id, updates);
    if (selectedNote?.id === note.id) {
      setSelectedNote(updatedNote);
    }
    refreshNotes();
  };

  const handleAddTag = (note: Note) => {
    if (!newTag.trim()) return;
    
    const updatedTags = [...note.tags, newTag.trim()];
    handleUpdateNote(note, { tags: updatedTags });
    setNewTag('');
    setTags(noteService.getAllTags());
  };

  const handleRemoveTag = (note: Note, tagToRemove: string) => {
    const updatedTags = note.tags.filter(tag => tag !== tagToRemove);
    handleUpdateNote(note, { tags: updatedTags });
    setTags(noteService.getAllTags());
  };

  const handleMoveToFolder = (note: Note, newFolder: string) => {
    handleUpdateNote(note, { folder: newFolder });
    setFolders(noteService.getFolders());
  };

  const handleCreateFolder = () => {
    if (!newFolder.trim()) return;
    
    if (selectedNote) {
      handleMoveToFolder(selectedNote, newFolder);
    }
    setNewFolder('');
  };

  const handleSort = (field: NoteSortOptions['field']) => {
    setSort(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div className={`${styles.panel} ${retroStyles.retroContainer}`}>
      <div className={styles.sidebar}>
        <div className={`${styles.section} ${retroStyles.pixelated}`}>
          <h3>DATA BANKS</h3>
          <div className={styles.folderList}>
            <button
              className={`${styles.folderButton} ${!filter.folder ? styles.active : ''}`}
              onClick={() => setFilter(prev => ({ ...prev, folder: undefined }))}
            >
              ALL MEMORY BANKS
            </button>
            {folders.map(folder => (
              <button
                key={folder}
                className={`${styles.folderButton} ${filter.folder === folder ? styles.active : ''}`}
                onClick={() => setFilter(prev => ({ ...prev, folder }))}
              >
                {folder}
              </button>
            ))}
          </div>
          <div className={styles.newFolder}>
            <input
              type="text"
              value={newFolder}
              onChange={e => setNewFolder(e.target.value)}
              placeholder="NEW DATA BANK"
              className={retroStyles.retroInput}
            />
            <button
              onClick={handleCreateFolder}
              className={`${styles.button} ${retroStyles.pixelated}`}
              disabled={!newFolder.trim()}
            >
              CREATE
            </button>
          </div>
        </div>

        <div className={`${styles.section} ${retroStyles.pixelated}`}>
          <h3>TAGS</h3>
          <div className={styles.tagList}>
            {tags.map(tag => (
              <button
                key={tag}
                className={`${styles.tagButton} ${filter.tags?.includes(tag) ? styles.active : ''}`}
                onClick={() => setFilter(prev => ({
                  ...prev,
                  tags: prev.tags?.includes(tag)
                    ? prev.tags.filter(t => t !== tag)
                    : [...(prev.tags || []), tag]
                }))}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <div className={`${styles.controls} ${retroStyles.pixelated}`}>
          <div className={styles.search}>
            <input
              type="text"
              placeholder="SEARCH LOGS..."
              value={filter.searchText || ''}
              onChange={e => setFilter(prev => ({ ...prev, searchText: e.target.value }))}
              className={retroStyles.retroInput}
            />
          </div>
          <div className={styles.sort}>
            <button
              onClick={() => handleSort('title')}
              className={`${styles.sortButton} ${sort.field === 'title' ? styles.active : ''}`}
            >
              TITLE {sort.field === 'title' && (sort.direction === 'asc' ? '↑' : '↓')}
            </button>
            <button
              onClick={() => handleSort('createdAt')}
              className={`${styles.sortButton} ${sort.field === 'createdAt' ? styles.active : ''}`}
            >
              DATE {sort.field === 'createdAt' && (sort.direction === 'asc' ? '↑' : '↓')}
            </button>
          </div>
        </div>

        <div className={`${styles.noteList} ${retroStyles.crtEffect}`}>
          <div className={styles.newNote}>
            <input
              type="text"
              value={newNoteTitle}
              onChange={e => setNewNoteTitle(e.target.value)}
              placeholder="NEW LOG ENTRY TITLE..."
              className={retroStyles.retroInput}
            />
            <button
              onClick={handleCreateNote}
              className={`${styles.button} ${retroStyles.pixelated}`}
              disabled={!newNoteTitle.trim()}
            >
              CREATE NEW LOG
            </button>
          </div>

          {notes.map(note => (
            <div
              key={note.id}
              className={`${styles.noteItem} ${selectedNote?.id === note.id ? styles.selected : ''}`}
              onClick={() => {
                setSelectedNote(note);
                onNoteSelect?.(note);
              }}
            >
              <div className={styles.noteHeader}>
                <h4>{note.title}</h4>
                <div className={styles.noteActions}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteNote(note.id);
                    }}
                    className={`${styles.deleteButton} ${retroStyles.pixelated}`}
                  >
                    DELETE
                  </button>
                </div>
              </div>
              <div className={styles.noteMeta}>
                <span className={styles.folder}>{note.folder}</span>
                <span className={styles.date}>
                  {new Date(note.createdAt).toLocaleDateString()}
                </span>
              </div>
              <div className={styles.noteTags}>
                {note.tags.map(tag => (
                  <span key={tag} className={styles.tag}>
                    {tag}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveTag(note, tag);
                      }}
                      className={styles.removeTag}
                    >
                      ×
                    </button>
                  </span>
                ))}
                {selectedNote?.id === note.id && (
                  <div className={styles.addTag}>
                    <input
                      type="text"
                      value={newTag}
                      onChange={e => setNewTag(e.target.value)}
                      placeholder="Add tag..."
                      onClick={e => e.stopPropagation()}
                      onKeyPress={e => {
                        if (e.key === 'Enter') {
                          handleAddTag(note);
                        }
                      }}
                      className={retroStyles.retroInput}
                    />
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleAddTag(note);
                      }}
                      className={`${styles.button} ${retroStyles.pixelated}`}
                      disabled={!newTag.trim()}
                    >
                      ADD
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}; 