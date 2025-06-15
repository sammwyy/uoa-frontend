import { Download, Eraser, Palette, RotateCcw, Save, X } from "lucide-react";
import React, { useEffect, useRef, useState } from "react";

import { Button } from "../ui/Button";
import { Modal } from "../ui/Modal";
import { Slider } from "../ui/Slider";

interface DrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (imageData: string) => void;
}

interface DrawingTool {
  type: "pen" | "eraser";
  color: string;
  size: number;
}

const colors = [
  "#000000", "#FF0000", "#00FF00", "#0000FF", "#FFFF00", 
  "#FF00FF", "#00FFFF", "#FFA500", "#800080", "#FFC0CB"
];

export const DrawingModal: React.FC<DrawingModalProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [tool, setTool] = useState<DrawingTool>({
    type: "pen",
    color: "#000000",
    size: 3,
  });

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");
      if (ctx) {
        // Set canvas size
        canvas.width = 800;
        canvas.height = 600;
        
        // Set white background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set initial drawing settings
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
      }
    }
  }, [isOpen]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      setIsDrawing(true);
      ctx.beginPath();
      ctx.moveTo(x, y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      if (tool.type === "eraser") {
        ctx.globalCompositeOperation = "destination-out";
        ctx.lineWidth = tool.size * 2;
      } else {
        ctx.globalCompositeOperation = "source-over";
        ctx.strokeStyle = tool.color;
        ctx.lineWidth = tool.size;
      }

      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  const saveDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const imageData = canvas.toDataURL("image/png");
    onSave(imageData);
    onClose();
  };

  const downloadDrawing = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const link = document.createElement("a");
    link.download = `drawing-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary-500 to-secondary-500 flex items-center justify-center">
              <Palette className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                Drawing Canvas
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Create a drawing to send with your message
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            icon={X}
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400"
          />
        </div>

        {/* Tools */}
        <div className="flex flex-wrap items-center gap-4 p-4 bg-gray-50/50 dark:bg-gray-800/50 rounded-lg">
          {/* Tool Selection */}
          <div className="flex gap-2">
            <Button
              variant={tool.type === "pen" ? "primary" : "secondary"}
              size="sm"
              icon={Palette}
              onClick={() => setTool({ ...tool, type: "pen" })}
            >
              Pen
            </Button>
            <Button
              variant={tool.type === "eraser" ? "primary" : "secondary"}
              size="sm"
              icon={Eraser}
              onClick={() => setTool({ ...tool, type: "eraser" })}
            >
              Eraser
            </Button>
          </div>

          {/* Color Palette */}
          {tool.type === "pen" && (
            <div className="flex gap-2">
              {colors.map((color) => (
                <button
                  key={color}
                  onClick={() => setTool({ ...tool, color })}
                  className={`w-8 h-8 rounded-full border-2 transition-all duration-200 ${
                    tool.color === color
                      ? "border-gray-800 dark:border-gray-200 scale-110"
                      : "border-gray-300 dark:border-gray-600 hover:scale-105"
                  }`}
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          )}

          {/* Brush Size */}
          <div className="flex items-center gap-3 min-w-[200px]">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Size:
            </span>
            <Slider
              value={tool.size}
              onChange={(size) => setTool({ ...tool, size })}
              min={1}
              max={20}
              step={1}
              className="flex-1"
            />
            <span className="text-sm text-gray-500 dark:text-gray-400 w-8">
              {tool.size}
            </span>
          </div>

          {/* Clear Button */}
          <Button
            variant="secondary"
            size="sm"
            icon={RotateCcw}
            onClick={clearCanvas}
          >
            Clear
          </Button>
        </div>

        {/* Canvas */}
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden bg-white">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="block cursor-crosshair max-w-full h-auto"
            style={{ maxHeight: "400px" }}
          />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          <Button
            variant="secondary"
            onClick={downloadDrawing}
            icon={Download}
            className="flex-1"
          >
            Download
          </Button>
          <Button
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={saveDrawing}
            icon={Save}
            className="flex-1"
          >
            Send Drawing
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50/50 dark:bg-gray-800/50 p-3 rounded-lg">
          <p className="mb-1">
            <strong>Drawing Tips:</strong>
          </p>
          <ul className="space-y-1 list-disc list-inside">
            <li>Click and drag to draw on the canvas</li>
            <li>Use the eraser tool to remove parts of your drawing</li>
            <li>Adjust brush size for fine details or bold strokes</li>
            <li>Your drawing will be attached to your message when sent</li>
          </ul>
        </div>
      </div>
    </Modal>
  );
};