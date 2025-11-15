export default function useExportEvents() {
    const exportEvents = async () => {
      try {
        const response = await fetch("/api/events/export");
        if (!response.ok) throw new Error("Failed to export events");
  
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `calendar-export-${new Date().toISOString().split("T")[0]}.ics`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
      } catch (err) {
        console.error("Failed to export events:", err);
      }
    };
  
    return exportEvents;
}
  