import { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState, AppDispatch } from "../../redux/store";
import { fetchMenuHierarchy, toggleNode, expandAll, collapseAll, getMenusById, deleteMenu, fetchMenus } from "../../redux/slices/menuSlice";
import { ChevronDown, ChevronRight, Plus, Trash } from "lucide-react";

const TreeNode = ({ node, isFirst, selectedNodeId, onSelect, onAddSubmenu, onDelete }: { 
  node: any; 
  isFirst: boolean; 
  selectedNodeId: string | null; 
  onSelect: (id: string) => void;
  onAddSubmenu: (id: string, depth: number) => void;
  onDelete: (id: string, hasChildren: boolean) => void;
}) => {
  const dispatch = useDispatch<AppDispatch>();
  const isExpanded = useSelector((state: RootState) => state.menu.expandedNodes[node.id]);
  const isSelected = node.id === selectedNodeId;

  return (
    <div className="relative w-full mt-2 mb-2">
      {isExpanded && Array.isArray(node.children) && node.children.length > 0 && (
        <div className={`absolute left-4 top-6 ${isFirst ? "h-9" : "bottom-0 "} w-[1px] bg-gray-300`}></div>
      )}

      <div className={`flex items-center cursor-pointer text-black relative px-2 py-1 rounded-lg`}>
        {Array.isArray(node.children) && node.children.length > 0 && (
          <span className={` ${isFirst ? 'ml-0' : 'ml-2'}`} onClick={(e) => {
            e.stopPropagation();
            dispatch(toggleNode(node.id));
          }}>
            {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
          </span>
        )}

        {!Array.isArray(node.children) || node.children.length === 0 && <span className="ml-4" />}

        {!isFirst && <div className="absolute left-0 top-4 h-0.5 w-4 bg-gray-300"></div>}

        <span className="flex items-center text-lg ml-2" onClick={() => {
          onSelect(node.id);
          dispatch(getMenusById(node.id));
        }}>
          {node.name}
        </span>

        {isSelected && (
          <div className="flex items-center gap-2 ml-2">
            <button onClick={(e) => {
              e.stopPropagation();
              onAddSubmenu(node.id, node.depth);
            }} className="p-1 bg-blue-500 rounded-full">
              <Plus size={16} className="text-white" />
            </button>

            <button onClick={(e) => {
              e.stopPropagation();
              onDelete(node.id, Array.isArray(node.children) && node.children.length > 0);
            }} className="p-1 bg-red-500 rounded-full">
              <Trash size={16} className="text-white" />
            </button>
          </div>
        )}
      </div>

      {isExpanded && node.children && (
        <div className="ml-4 w-full">
          {node.children.map((child: any) => (
            <TreeNode key={child.id} node={child} isFirst={false} selectedNodeId={selectedNodeId} onSelect={onSelect} onAddSubmenu={onAddSubmenu} onDelete={onDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default function TreeView({ onSelect, onAddSubmenu }: { onSelect: (id: string) => void, onAddSubmenu: (id: string, depth: number) => void }) {
  const dispatch = useDispatch<AppDispatch>();
  const { menuHierarchy, loading, error } = useSelector((state: RootState) => state.menu);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchMenuHierarchy());
  }, [dispatch]);

  const handleDelete = (id: string, hasChildren: boolean) => {
    if (hasChildren) {
      if (window.confirm("Are you sure you want to delete the menu and all its submenus??")) {
        if (window.confirm("Confirmation: Do you really want to delete it?")) {
          dispatch(deleteMenu({
            id,
            cascade: true
          })).unwrap()
                  .then(() => {
                    alert("Menu Deleted successfully!");
                    dispatch(fetchMenus());
                    dispatch(fetchMenuHierarchy());
                  })
                  .catch((error) => {
                    alert(`Error updating menu: ${error}`);
                  });
        }
      }
    } else {
      if (window.confirm("Are you sure you want to remove this menu?")) {
        dispatch(deleteMenu({            
          id,
          cascade: false
        })).unwrap()
        .then(() => {
          alert("Menu Deleted successfully!");
          dispatch(fetchMenus());
          dispatch(fetchMenuHierarchy());
        })
        .catch((error) => {
          alert(`Error updating menu: ${error}`);
        });
      }
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div className="bg-white text-black  w-full">
      <div className="flex gap-4 mb-4">
        <button
          onClick={() => dispatch(expandAll())}
          className="w-[133px] bg-[#1D2939] text-white py-2 rounded-3xl font-semibold"
        >
          Expand All
        </button>
        <button
          onClick={() => dispatch(collapseAll())}
          className="w-[133px] bg-gray-300 border py-2 rounded-3xl font-semibold"
        >
          Collapse All
        </button>
      </div>

      {menuHierarchy.map((node) => (
        <TreeNode 
          key={node.id} 
          node={node} 
          isFirst={true} 
          selectedNodeId={selectedNodeId} 
          onSelect={(id) => setSelectedNodeId(id)} 
          onAddSubmenu={onAddSubmenu}
          onDelete={handleDelete}
        />
      ))}
    </div>
  );
}
