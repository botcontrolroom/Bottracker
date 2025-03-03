/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { X, FileSpreadsheet, Upload } from "lucide-react";
import * as XLSX from "xlsx";
import { NewBotData, platforms } from "@/hooks/useBotOperations";
import { useToast } from "@/hooks/use-toast";
import Popup from "@/components/dashboard/Popup";
interface ImportBotsModalProps {
  onImport: (bots: NewBotData[]) => void;
  onCancel: () => void;
}

export const ImportBotsModal = ({
  onImport,
  onCancel,
}: ImportBotsModalProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const parseExcelData = async () => {
    if (!file) {
      toast({
        title: "No file selected",
        description: "Please select an Excel file to import",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet) as any[];

      if (jsonData.length === 0) {
        toast({
          title: "Empty file",
          description: "The Excel file contains no data",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }

      // Log the first row to help debugging
      console.log("Excel first row:", jsonData[0]);

      // Map Excel data to NewBotData format
      const parsedBots: NewBotData[] = jsonData.map((row) => {
        // Handle the time format - assuming format like "12:00 A.M. - 05:20 A.M."
        const timeRange = String(
          row["Timining"] || row["Timing"] || row["Timing "] || ""
        ).split(" - ");
        const startTimeStr = timeRange[0] || "12:00 A.M.";
        const endTimeStr = timeRange[1] || "12:00 A.M.";

        // Parse start time
        const startTimeParts = startTimeStr.match(/(\d+):(\d+)\s+([AP])\.M\./i);
        const startTime = startTimeParts
          ? {
              hour: startTimeParts[1],
              minute: startTimeParts[2],
              period: startTimeParts[3] + "M",
            }
          : { hour: "12", minute: "00", period: "AM" };

        // Parse end time
        const endTimeParts = endTimeStr.match(/(\d+):(\d+)\s+([AP])\.M\./i);
        const endTime = endTimeParts
          ? {
              hour: endTimeParts[1],
              minute: endTimeParts[2],
              period: endTimeParts[3] + "M",
            }
          : { hour: "12", minute: "00", period: "AM" };

        // Handle days - if it's 5, select Monday to Friday; if 7, select all days
        const days = parseInt(String(row["Days"] || "0"));
        const weekDays = [
          "Monday",
          "Tuesday",
          "Wednesday",
          "Thursday",
          "Friday",
          "Saturday",
          "Sunday",
        ];
        const scheduledDays =
          days === 5 ? weekDays.slice(0, 5) : days === 7 ? weekDays : [];

        // Handle platform selection - find closest match in platforms list
        const platformInput = String(row["Platform"] || "").toLowerCase();
        const platformMatch =
          platforms.find((p) => platformInput.includes(p.toLowerCase())) ||
          platforms[0];

        // Extract machine name and bot name from the Excel columns
        // Using different possible column variations based on the Excel format
        const machineName = String(
          row["Machine name"] || row["Machine name "] || ""
        );
        const botName = String(
          row["Bot name"] || row["Bot Name"] || row["Process Name"] || ""
        );

        return {
          name: botName,
          machineName: machineName,
          platform: platformMatch,
          startTime,
          endTime,
          scheduledDays,
        };
      });

      onImport(parsedBots);
      toast({
        title: "Import successful",
        description: `Imported ${parsedBots.length} bots from Excel`,
      });
    } catch (error) {
      console.error("Error parsing Excel:", error);
      toast({
        title: "Import failed",
        description: "Could not parse the Excel file. Please check the format.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Import Bots from Excel</h2>
          <Button variant="ghost" size="icon" onClick={onCancel}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <FileSpreadsheet className="h-10 w-10 mx-auto mb-2 text-gray-400" />
            <p className="text-sm text-gray-500 mb-2">
              Upload an Excel file with bot details
            </p>
            <p className="text-xs text-gray-400 mb-4">
              Required columns: Machine name, Process Name, Platform, Timing,
              Days
            </p>
            
            <Input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
              id="excel-file"
            />
            <div>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => document.getElementById("excel-file")?.click()}
              >
                <Upload className="h-4 w-4 mr-2" />
                Select File
              </Button>
            </div>
            <div>
              <Popup />
            </div>
            {file && (
              <p className="text-sm text-gray-600 mt-2">
                Selected: {file.name}
              </p>
            )}
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button
              onClick={parseExcelData}
              disabled={!file || isLoading}
              className="bg-slate-800 hover:bg-slate-900 text-white"
            >
              {isLoading ? "Processing..." : "Import Bots"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
