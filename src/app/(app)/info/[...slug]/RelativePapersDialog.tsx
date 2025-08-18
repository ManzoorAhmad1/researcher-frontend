import { getRelativePdf } from "@/apis/files";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import React, { useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { RootState } from "@/reducer/store";
import RelativePapersInfo from "./RelativePapersInfo";
import { PDFData as PDFDataType } from "@/types/types";
import { LoaderCircleIcon } from "lucide-react";
import Tree from "react-d3-tree";

interface RelativePapersDialogProps {
  show: boolean;
  setShow: (show: boolean) => void;
  id: string | undefined;
  PDFData: PDFDataType;
}

const RelativePapersDialog: React.FC<RelativePapersDialogProps> = ({
  PDFData,
  show,
  setShow,
  id,
}) => {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: "",
    nodeX: 0,
    nodeY: 0,
  });
  const [singleData, setSingleData] = useState({});
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [chart, setChart] = useState({
    tooltip: "Main Paper",
    name: "Main Paper",
    color: "hsl(147, 70%, 50%)",
    children: [],
  });
  const chartContainerRef = useRef<HTMLDivElement>(null);
  const dialogContentRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 700 });
  
  useEffect(() => {
    if (show) {
      setLoading(true);
      const fetchPdf = async () => {
        try {
          const response = await getRelativePdf(id) as any;
          if (response?.data?.data?.length > 0) {
            setError(false);
            setChart((prev) => ({
              ...prev,
              children: response.data.data,
            }));
          } else {
            setError(true);
          }
        } catch (error) {
          console.error("Failed to fetch relative PDF:", error);
          setError(true);
        } finally {
          setLoading(false);
        }
      };
      fetchPdf();
    }
  }, [show, id]);

  useEffect(() => {
    const updateDimensions = () => {
      if (chartContainerRef.current) {
        const containerWidth = chartContainerRef.current.offsetWidth;
        setDimensions({
          width: Math.max(containerWidth, 300),
          height: Math.min(window.innerHeight * 0.8, 700),
        });
      }
    };

    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);

  const handleNodeClick = (node: any) => {
    console.log("🚀 ~ handleNodeClick ~ node:", node)
    if (node?.__rd3t.depth === 2) {
      setSingleData(node);
      setVisible(true);
    }
  };

  const handleDialogClose = () => {
    if (!visible) {
      setShow(false);
    }
  };

  const handleMouseOver = (event: React.MouseEvent, node: any) => {
    if (chartContainerRef.current) {
      const containerRect = chartContainerRef.current.getBoundingClientRect();
      setTooltip({
        visible: true,
        x: event.clientX - containerRect.left + 10,
        y: event.clientY - containerRect.top - 20,
        text: node.tooltip,
        nodeX: node.x || 0,
        nodeY: node.y || 0,
      });
    }
  };

  const handleMouseOut = () => {
    setTooltip((prev) => ({ ...prev, visible: false }));
  };

  const renderCustomNodeElement = ({ nodeDatum }: any) => {

    return <g>
    <circle
      r={8}
      fill={nodeDatum?.color}
      onMouseOver={(e) => {
        e.stopPropagation();
        handleMouseOver(e, nodeDatum);
      }}
      onMouseOut={handleMouseOut}
      onClick={(e) => {
        e.stopPropagation();
        handleNodeClick(nodeDatum);
      }}
    />
    <text
      className={`mt-2 fill-black dark:fill-white`}
      x={-10}
      y={25}
      onMouseOver={(e) => {
        e.stopPropagation();
        handleMouseOver(e, nodeDatum);
      }}
      onMouseOut={handleMouseOut}
      onClick={(e) => {
        e.stopPropagation();
        handleNodeClick(nodeDatum);
      }}
    >
      {nodeDatum.name}
    </text>
  </g>
  }

  useEffect(() => {
    const updateDimensions = () => {
      const chartContainer = document.getElementById("chart-container");
      if (chartContainer) {
        const containerWidth = chartContainer.offsetWidth;
        setDimensions({
          width: Math.max(containerWidth, 300),
          height: Math.min(window.innerHeight * 0.8, 700),
        });
      }
    };
  
    updateDimensions();
    window.addEventListener("resize", updateDimensions);
    return () => window.removeEventListener("resize", updateDimensions);
  }, []);
  
  

  return (
    <>
      <Dialog  open={show} onOpenChange={handleDialogClose}>
        <DialogContent className="max-w-[70rem] h-[95vh] overflow-auto" id="chart-container" ref={dialogContentRef}>
          <DialogHeader className="text-lg font-semibold">
            <span className="dark:text-[#BEBFBF] font-semibold">
              Related Papers
            </span>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center h-[80vh]">
              <LoaderCircleIcon className="animate-spin h-10 w-10 mx-auto" />
            </div>
          ) : error ? (
            <div className="flex items-center justify-center h-[80vh]">
              No data available
            </div>
          ) : (
            <div className="h-[80vh] relative" ref={chartContainerRef}>
              <Tree
                data={chart}
                zoomable={false}
                collapsible={false}
                translate={{x:dimensions.width / 15,y:dimensions.height / 2}}
                shouldCollapseNeighborNodes={false}
                separation={{ siblings: 1, nonSiblings: 1.5 }}
                nodeSize={{ x: 60, y: 80 }}
                zoom={0.8}
                initialDepth={2}
                depthFactor={450}
                renderCustomNodeElement={renderCustomNodeElement}
              />
              
              {/* Custom Tooltip */}
              {tooltip.visible && (
                <div
                  className="absolute bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded shadow-lg p-2 text-sm pointer-events-none z-50"
                  style={{
                    left: `${tooltip.x}px`,
                    top: `${tooltip.y}px`,
                    transform: 'translate(-50%, -100%)',
                  }}
                >
                  {tooltip.text}
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {visible && (
        <RelativePapersInfo
          visible={visible}
          setVisible={setVisible}
          singleData={singleData}
        />
      )}
    </>
  );
};

export default RelativePapersDialog;