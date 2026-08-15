import { useState, useRef, useCallback } from 'react';
import { ZoomIn, ZoomOut, Maximize2, Search, ChevronDown, Heart } from 'lucide-react';
import { useHeritage } from '@/context/HeritageContext';
import { members as fallbackMembers, familyTree as fallbackTree } from '@/data/mockData';

function TreeNode({ member, selected, highlighted, onSelect }) {
  if (!member) return null;
  return (
    <button
      onClick={() => onSelect(member)}
      className={`tree-node ${selected ? 'tree-node-selected' : ''} ${highlighted ? 'tree-node-highlighted' : ''}`}
    >
      <div className="tree-node-photo-wrap">
        <img src={member.photo} className="tree-node-photo" alt={member.name} />
        <span className="tree-node-gen">{member.relationship}</span>
      </div>
      <span className="tree-node-name">{member.name}</span>
      <span className="tree-node-info">b. {member.birthYear}</span>
    </button>
  );
}

function TreeBranch({
  couple,
  level,
  onSelect,
  selectedId,
  searchQuery,
  collapsedGens,
  toggleGen,
  showGenLabel,
  memberById,
  couplesList,
  generationsList,
}) {
  const coupleMembers = (couple.members || []).map(memberById).filter(Boolean);
  const childCouples = couplesList.filter((c) => c.parent === couple.id);
  const allChildren = couple.children || [];
  const singleChildren = allChildren
    .filter((id) => !couplesList.some((c) => (c.members || []).includes(String(id))))
    .map(memberById)
    .filter(Boolean);
  const hasChildren = childCouples.length > 0 || singleChildren.length > 0;
  const isCollapsed = collapsedGens.includes(level + 1);
  const genLabel = generationsList[level];
  const hl = (m) => searchQuery && m && m.name.toLowerCase().includes(searchQuery.toLowerCase());

  return (
    <div className="tree-branch">
      {showGenLabel && genLabel && (
        <div className="tree-gen-label">
          <span className="tree-gen-name">{genLabel.label}</span>
          <span className="tree-gen-subtitle">{genLabel.subtitle}</span>
        </div>
      )}
      <div className="tree-couple">
        <TreeNode
          member={coupleMembers[0]}
          onSelect={onSelect}
          selected={selectedId === coupleMembers[0]?.id || selectedId === coupleMembers[0]?._id}
          highlighted={hl(coupleMembers[0])}
        />
        {coupleMembers[1] && <div className="tree-spouse-line" />}
        {coupleMembers[1] && (
          <TreeNode
            member={coupleMembers[1]}
            onSelect={onSelect}
            selected={selectedId === coupleMembers[1]?.id || selectedId === coupleMembers[1]?._id}
            highlighted={hl(coupleMembers[1])}
          />
        )}
      </div>
      {hasChildren && (
        <>
          <div className="tree-connector" />
          {isCollapsed ? (
            <button className="tree-collapse-btn" onClick={() => toggleGen(level + 1)}>
              <ChevronDown className="w-4" /> Expand {allChildren.length} {level === 0 ? 'children' : 'members'}
            </button>
          ) : (
            <div className="tree-children-row">
              {childCouples.map((cc, i) => (
                <div className="tree-child-item" key={cc.id}>
                  <TreeBranch
                    couple={cc}
                    level={level + 1}
                    onSelect={onSelect}
                    selectedId={selectedId}
                    searchQuery={searchQuery}
                    collapsedGens={collapsedGens}
                    toggleGen={toggleGen}
                    showGenLabel={i === 0}
                    memberById={memberById}
                    couplesList={couplesList}
                    generationsList={generationsList}
                  />
                </div>
              ))}
              {singleChildren.map((child) => (
                <div className="tree-child-item" key={child.id || child._id}>
                  <TreeNode
                    member={child}
                    onSelect={onSelect}
                    selected={selectedId === child.id || selectedId === child._id}
                    highlighted={hl(child)}
                  />
                </div>
              ))}
              {hasChildren && level < generationsList.length - 1 && (
                <button
                  className="tree-collapse-btn tree-collapse-float"
                  onClick={() => toggleGen(level + 1)}
                >
                  <ChevronDown className="w-4" /> Collapse
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default function FamilyTreeCanvas({ onSelect }) {
  const { members: ctxMembers, treeData } = useHeritage();
  const [zoom, setZoom] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [collapsedGens, setCollapsedGens] = useState([]);
  const viewportRef = useRef(null);

  const activeMembers = ctxMembers && ctxMembers.length > 0 ? ctxMembers : fallbackMembers;
  const activeTree =
    treeData && treeData.couples && treeData.couples.length > 0
      ? treeData
      : fallbackTree;

  const memberById = (id) =>
    activeMembers.find((m) => String(m.id || m._id) === String(id));

  const rootCouple =
    activeTree.couples.find((c) => !c.parent) || activeTree.couples[0];
  const toggleGen = useCallback(
    (level) =>
      setCollapsedGens((prev) =>
        prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
      ),
    []
  );

  const handleSelect = useCallback(
    (member) => {
      setSelectedId(member.id || member._id);
      onSelect?.(member);
    },
    [onSelect]
  );

  return (
    <div className="tree-canvas-container">
      <div className="tree-top-controls">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-2.5 w-4 text-stone-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search family member..."
            className="w-full rounded-lg border border-[#e5dcc8] bg-white py-2 pl-9 pr-3 text-sm focus:border-[#58752c] outline-none"
          />
        </div>
        <div className="flex gap-1.5">
          <button
            className="tree-zoom-btn"
            onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
            title="Zoom in"
          >
            <ZoomIn className="w-4" />
          </button>
          <button
            className="tree-zoom-btn"
            onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
            title="Zoom out"
          >
            <ZoomOut className="w-4" />
          </button>
          <button
            className="tree-zoom-btn"
            onClick={() => {
              setZoom(1);
              setCollapsedGens([]);
            }}
            title="Reset view"
          >
            <Maximize2 className="w-4" />
          </button>
        </div>
      </div>

      <div className="tree-viewport" ref={viewportRef}>
        <div
          className="tree-content"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center' }}
        >
          {rootCouple && (
            <TreeBranch
              couple={rootCouple}
              level={0}
              onSelect={handleSelect}
              selectedId={selectedId}
              searchQuery={search}
              collapsedGens={collapsedGens}
              toggleGen={toggleGen}
              showGenLabel
              memberById={memberById}
              couplesList={activeTree.couples}
              generationsList={activeTree.generations}
            />
          )}
        </div>
      </div>

      <div className="tree-legend">
        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <span className="w-3 h-3 rounded-full border-2 border-[#58752c]" /> Selected
        </div>
        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <span className="w-3 h-3 rounded-full border-2 border-[#e89538]" /> Search match
        </div>
        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <span className="w-6 h-px bg-[#c4b89e]" /> Spouse
        </div>
        <div className="flex items-center gap-1.5 text-xs text-stone-500">
          <span className="w-px h-4 bg-[#c4b89e]" /> Parent–child
        </div>
        <div className="flex items-center gap-1.5 text-xs text-stone-500 ml-auto">
          <Heart className="w-3 text-[#c4b89e]" /> {activeMembers.length} family members
        </div>
      </div>
    </div>
  );
}