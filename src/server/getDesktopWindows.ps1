Add-Type @"
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices;
using System.Text;

public class WinEnumerator {
    public delegate bool EnumDesktopWindowsProc(IntPtr hWnd, IntPtr lParam);
    [DllImport("user32.dll")] public static extern IntPtr OpenDesktop(string lpszDesktop, uint dwFlags, bool fInherit, uint dwDesiredAccess);
    [DllImport("user32.dll")] public static extern bool CloseDesktop(IntPtr hDesktop);
    [DllImport("user32.dll")] public static extern bool EnumDesktopWindows(IntPtr hDesktop, EnumDesktopWindowsProc lpfn, IntPtr lParam);
    [DllImport("user32.dll")] public static extern int GetWindowText(IntPtr hWnd, StringBuilder lpString, int nMaxCount);
    [DllImport("user32.dll")] public static extern bool IsWindowVisible(IntPtr hWnd);
    [DllImport("user32.dll")] public static extern uint GetWindowThreadProcessId(IntPtr hWnd, out uint lpdwProcessId);

    public class WinItem { public uint Pid; public string Title; }

    public static List<WinItem> GetWindows() {
        var list = new List<WinItem>();
        IntPtr hDesktop = OpenDesktop("Default", 0, false, 0x0001 | 0x0040);
        if (hDesktop == IntPtr.Zero) return list;

        EnumDesktopWindows(hDesktop, (hWnd, lParam) => {
            if (IsWindowVisible(hWnd)) {
                var sb = new StringBuilder(512);
                GetWindowText(hWnd, sb, 512);
                string title = sb.ToString().Trim();
                if (!string.IsNullOrEmpty(title) && 
                    title != "Program Manager" && 
                    title != "MSCTFIME UI" && 
                    title != "Default IME" &&
                    !title.StartsWith("Cua.") &&
                    title != "Windows Input Experience") {
                    uint pid;
                    GetWindowThreadProcessId(hWnd, out pid);
                    list.Add(new WinItem { Pid = pid, Title = title });
                }
            }
            return true;
        }, IntPtr.Zero);

        CloseDesktop(hDesktop);
        return list;
    }
}
"@ -ErrorAction SilentlyContinue

$wins = [WinEnumerator]::GetWindows()
$winPids = $wins | ForEach-Object { $_.Pid } | Select-Object -Unique
$allProcs = Get-Process -ErrorAction SilentlyContinue

$openApps = @()
foreach ($w in $wins) {
    $p = $allProcs | Where-Object { $_.Id -eq $w.Pid } | Select-Object -First 1
    $openApps += [PSCustomObject]@{
        Pid = $w.Pid
        Title = $w.Title
        ProcessName = if ($p) { $p.ProcessName } else { "Unknown" }
        WorkingSetMb = if ($p) { [math]::Round($p.WorkingSet64 / 1MB) } else { 0 }
        CpuSeconds = if ($p -and $p.CPU) { [math]::Round($p.CPU) } else { 0 }
        Priority = if ($p) { $p.BasePriority } else { 8 }
        Responding = if ($p) { $p.Responding } else { $true }
    }
}

$bgProcs = $allProcs | Where-Object { $winPids -notcontains $_.Id -and $_.WorkingSet64 -gt 35MB } | 
           Sort-Object WorkingSet64 -Descending | 
           Select-Object -First 30 | 
           ForEach-Object {
               [PSCustomObject]@{
                   Pid = $_.Id
                   Title = ""
                   ProcessName = $_.ProcessName
                   WorkingSetMb = [math]::Round($_.WorkingSet64 / 1MB)
                   CpuSeconds = if ($_.CPU) { [math]::Round($_.CPU) } else { 0 }
                   Priority = $_.BasePriority
                   Responding = $_.Responding
               }
           }

@{
    OpenApps = $openApps
    Background = $bgProcs
} | ConvertTo-Json -Depth 3 -Compress
