"use client";
import { useSearchParams } from "next/navigation";
import { useEffect, useState, useCallback, useRef } from "react";
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MarkerType,
  Panel,
  Handle,
  Position,
  useUpdateNodeInternals,
  ReactFlowProvider,
} from "reactflow";
import "reactflow/dist/style.css";

// Custom Node Component
const CustomNode = ({ data, id }) => {
  const handleAddChild = () => {
    if (data.onAddChild) {
      data.onAddChild(id);
    }
  };

  return (
    <div className="bg-[#204933] text-white rounded-lg shadow-lg text-center min-w-48 max-w-96">
      {/* Source handle at the bottom */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom"
        style={{ background: "#00FFFF", width: "10px", height: "10px" }}
      />

      {/* Target handle at the top */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ background: "#00FFFF", width: "10px", height: "10px" }}
      />

      <h1 className="py-2 text-lg">{data.title}</h1>
      <div className="w-full bg-[#7AC8B5] rounded-lg p-4">{data.content}</div>
      <button
        onClick={handleAddChild}
        className="bg-[#386e51] hover:bg-[#4a8e6a] text-white py-1 px-3 rounded-b-lg w-full"
      >
        + Add Child Node
      </button>
    </div>
  );
};

// Define node types
const nodeTypes = {
  custom: CustomNode,
};

export default function MindMapsPage() {
  return (
    <ReactFlowProvider>
      <MindMapContent />
    </ReactFlowProvider>
  );
}

// Main content component
function MindMapContent() {
  const searchParams = useSearchParams();
  const [rootTitle, setRootTitle] = useState("My Mind Map");
  const updateNodeInternals = useUpdateNodeInternals();

  // Initial nodes and edges
  const initialNodes = [
    {
      id: "1",
      type: "custom",
      data: {
        title: rootTitle,
        content:
          "Root node content. Click the button below to add child nodes!",
        childCount: 0,
      },
      position: { x: 250, y: 50 },
    },
  ];

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [selectedParentId, setSelectedParentId] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [newNodeTitle, setNewNodeTitle] = useState("");
  const [newNodeContent, setNewNodeContent] = useState("");

  const titleInputRef = useRef(null);

  // Update root title if provided in URL
  useEffect(() => {
    const titleFromURL = searchParams.get("rootTitle");
    if (titleFromURL) {
      setRootTitle(titleFromURL);
      setNodes((nds) =>
        nds.map((node) => {
          if (node.id === "1") {
            return {
              ...node,
              data: {
                ...node.data,
                title: titleFromURL,
                onAddChild: handleAddChildNode,
              },
            };
          }
          return node;
        })
      );
    }
  }, [searchParams]);

  // Initialize nodes with the onAddChild function
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          onAddChild: handleAddChildNode,
        },
      }))
    );
  }, []);

  // Ensure edges are properly initialized
  useEffect(() => {
    if (edges.length > 0) {
      setEdges((currentEdges) =>
        currentEdges.map((edge) => ({
          ...edge,
          type: "smoothstep",
          animated: true,
          style: {
            stroke: "#00FFFF",
            strokeWidth: 3,
            zIndex: 1000,
          },
          markerEnd: {
            type: MarkerType.ArrowClosed,
            color: "#00FFFF",
            width: 20,
            height: 20,
          },
        }))
      );
    }
  }, [nodes]);

  // Handle connections between nodes
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge(
          {
            ...params,
            type: "straight", // Use straight line type for maximum visibility
            animated: true,
            style: { stroke: "#00FFFF", strokeWidth: 5 }, // Bright cyan with increased width
            markerEnd: {
              type: MarkerType.ArrowClosed,
              color: "#00FFFF",
              width: 25,
              height: 25,
            },
          },
          eds
        )
      ),
    [setEdges]
  );

  // Handle adding a child node
  const handleAddChildNode = useCallback((parentId) => {
    setSelectedParentId(parentId);
    setNewNodeTitle("");
    setNewNodeContent("");
    setShowModal(true);

    // Focus on title input when modal opens
    setTimeout(() => {
      if (titleInputRef.current) {
        titleInputRef.current.focus();
      }
    }, 100);
  }, []);

  // Create the new node with user input
  const handleCreateNode = () => {
    if (!selectedParentId || !newNodeTitle.trim()) return;

    // Find the parent node
    const parentNode = nodes.find((node) => node.id === selectedParentId);
    if (!parentNode) return;

    const childCount = parentNode.data.childCount || 0;

    // Improved spacing calculations
    const verticalSpacing = 250; // Increased vertical gap
    const horizontalSpacing = 350; // Base horizontal spacing between siblings

    // Calculate horizontal position based on parent's children count
    // This will position children in a balanced way around the parent
    const isEven = childCount % 2 === 0;
    const childIndex = childCount;
    let horizontalOffset;

    if (isEven) {
      // Even numbered children
      horizontalOffset =
        ((childIndex + 1) / 2) * horizontalSpacing * (childIndex % 2 ? 1 : -1);
    } else {
      // Odd numbered children
      horizontalOffset =
        Math.floor(childIndex / 2 + 1) *
        horizontalSpacing *
        (childIndex % 2 ? 1 : -1);
    }

    const newNodeId = `${selectedParentId}-${childCount + 1}`;
    const newX = parentNode.position.x + horizontalOffset;
    const newY = parentNode.position.y + verticalSpacing;

    // Create new node
    const newNode = {
      id: newNodeId,
      type: "custom",
      data: {
        title: newNodeTitle,
        content: newNodeContent || "No description provided",
        childCount: 0,
        onAddChild: handleAddChildNode,
      },
      position: { x: newX, y: newY },
    };

    // Create edge from parent to new node
    const newEdge = {
      id: `e${selectedParentId}-${newNodeId}`,
      source: selectedParentId,
      target: newNodeId,
      sourceHandle: "bottom",
      targetHandle: "top",
      type: "smoothstep",
      animated: true,
      style: {
        stroke: "#00FFFF",
        strokeWidth: 3,
      },
      markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "#00FFFF",
        width: 20,
        height: 20,
      },
    };

    // Update nodes and edges
    setNodes((nds) => {
      const updatedNodes = nds.map((n) => {
        if (n.id === selectedParentId) {
          return {
            ...n,
            data: {
              ...n.data,
              childCount: childCount + 1,
            },
          };
        }
        return n;
      });
      return [...updatedNodes, newNode];
    });

    setEdges((eds) => [...eds, newEdge]);

    // Update node internals to ensure handles are properly positioned
    setTimeout(() => {
      updateNodeInternals(newNodeId);
      updateNodeInternals(selectedParentId);
    }, 0);

    setShowModal(false);
  };

  return (
    <>
      {/* Background blur elements */}
      <div className="absolute inset-0 flex justify-center items-center -z-10">
        <div className="w-[600px] h-[600px] bg-[#26583d] opacity-20 blur-3xl rounded-full animate-pulse-slow"></div>
      </div>
      <div className="absolute inset-0 flex items-end -z-10">
        <div className="w-[300px] h-[300px] bg-[#386e51] opacity-20 blur-3xl rounded-full animate-float-slow"></div>
      </div>
      <div className="absolute inset-0 justify-end items-start flex -z-10">
        <div className="w-[300px] h-[300px] bg-[#1c7043] opacity-20 blur-3xl rounded-full animate-breathe"></div>
      </div>

      <div className="relative w-full h-screen text-white">
        <h1 className="text-2xl p-4 text-center absolute top-0 left-0 right-0 z-10">
          Your Mind Map
        </h1>

        <div className="w-full h-full" style={{ overflow: "visible" }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
            className="bg-transparent"
            style={{ overflow: "visible" }}
            defaultEdgeOptions={{
              type: "smoothstep",
              animated: true,
              style: { stroke: "#00FFFF", strokeWidth: 3 },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                color: "#00FFFF",
              },
            }}
          >
            <Background color="#7AC8B5" variant="dots" gap={24} size={1} />
            <Panel position="bottom" className="bg-[#204933] p-2 rounded">
              <div className="text-white text-sm">
                Click "Add Child Node" to create connected nodes
              </div>
            </Panel>
          </ReactFlow>
        </div>

        {/* Modal for creating new nodes */}
        {showModal && (
          <div className="fixed inset-0 flex items-center justify-center bg-black/65 z-50">
            <div className="bg-[#204933] rounded-lg p-4 lg:p-6 w-60 lg:w-96 shadow-xl">
              <h2 className="text-lg lg:text-xl mb-4 font-semibold">
                Add New Node
              </h2>

              <div className="mb-4">
                <label className="block mb-2">Title</label>
                <input
                  ref={titleInputRef}
                  type="text"
                  value={newNodeTitle}
                  onChange={(e) => setNewNodeTitle(e.target.value)}
                  className="w-full p-2 rounded text-gray-200"
                  placeholder="Enter node title"
                />
              </div>

              <div className="lg:mb-6">
                <label className="block mb-2">Description</label>
                <textarea
                  value={newNodeContent}
                  onChange={(e) => setNewNodeContent(e.target.value)}
                  className="w-full p-2 rounded text-gray-200 h-16 lg:h-24"
                  placeholder="Enter node description"
                />
              </div>

              <div className="flex justify-center lg:justify-end gap-3">
                <button
                  onClick={() => setShowModal(false)}
                  className="bg-gray-500 py-1 text-sm lg:py-2 px-4 rounded hover:bg-gray-600"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateNode}
                  className="bg-[#7AC8B5] text-gray-800 py-1 text-sm lg:py-2 px-4 rounded hover:bg-[#8edac8]"
                  disabled={!newNodeTitle.trim()}
                >
                  Create Node
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
