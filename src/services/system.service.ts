import { exec } from "node:child_process"
import { promisify } from "node:util"
import type { SystemInfo } from "../types/config.types.js"

const execAsync = promisify(exec)

export async function getSystemInfo(): Promise<SystemInfo> {
	const platform = process.platform

	try {
		switch (platform) {
			case "linux":
				return getLinuxInfo()
			case "darwin":
				return getMacOSInfo()
			case "win32":
				return getWindowsInfo()
			default:
				return getGenericInfo(platform)
		}
	} catch (error) {
		console.error("Error getting system info:", error)
		return getGenericInfo(platform)
	}
}

async function getLinuxInfo(): Promise<SystemInfo> {
	const [cpu, memory, disk, uptime] = await Promise.all([
		getLinuxCPU(),
		getLinuxMemory(),
		getLinuxDisk(),
		getLinuxUptime(),
	])

	return {
		cpu,
		memory,
		disk,
		uptime,
		platform: "linux",
	}
}

async function getMacOSInfo(): Promise<SystemInfo> {
	const [cpu, memory, disk, uptime] = await Promise.all([
		getMacOSCPU(),
		getMacOSMemory(),
		getMacOSDisk(),
		getMacOSUptime(),
	])

	return {
		cpu,
		memory,
		disk,
		uptime,
		platform: "darwin",
	}
}

async function getWindowsInfo(): Promise<SystemInfo> {
	const [cpu, memory, disk, uptime] = await Promise.all([
		getWindowsCPU(),
		getWindowsMemory(),
		getWindowsDisk(),
		getWindowsUptime(),
	])

	return {
		cpu,
		memory,
		disk,
		uptime,
		platform: "win32",
	}
}

async function getGenericInfo(platform: NodeJS.Platform): Promise<SystemInfo> {
	const memUsage = process.memoryUsage()
	const uptime = process.uptime()

	return {
		cpu: "N/A",
		memory: `Node.js: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB / ${Math.round(memUsage.heapTotal / 1024 / 1024)}MB`,
		disk: "N/A",
		uptime: `${Math.floor(uptime / 86400)}d ${Math.floor((uptime % 86400) / 3600)}h ${Math.floor((uptime % 3600) / 60)}m`,
		platform,
	}
}

// Linux implementations
async function getLinuxCPU(): Promise<string> {
	try {
		const { stdout } = await execAsync(
			"top -bn1 | grep 'Cpu(s)' | sed 's/.*, *\\([0-9.]*\\)%* id.*/\\1/' | awk '{print 100 - $1\"%\"}'",
		)
		return `CPU Usage: ${stdout.trim()}`
	} catch {
		return "CPU: N/A"
	}
}

async function getLinuxMemory(): Promise<string> {
	try {
		const { stdout } = await execAsync('free -h | grep "Mem:"')
		const parts = stdout.trim().split(/\s+/)
		return `Memory: ${parts[2]} / ${parts[1]} (${Math.round((parseFloat(parts[2]) / parseFloat(parts[1])) * 100)}%)`
	} catch {
		return "Memory: N/A"
	}
}

async function getLinuxDisk(): Promise<string> {
	try {
		const { stdout } = await execAsync("df -h / | tail -1")
		const parts = stdout.trim().split(/\s+/)
		return `Disk: ${parts[2]} / ${parts[1]} (${parts[4]})`
	} catch {
		return "Disk: N/A"
	}
}

async function getLinuxUptime(): Promise<string> {
	try {
		const { stdout } = await execAsync("uptime -p")
		return `Uptime: ${stdout.trim().replace("up ", "")}`
	} catch {
		return "Uptime: N/A"
	}
}

// macOS implementations
async function getMacOSCPU(): Promise<string> {
	try {
		const { stdout } = await execAsync(
			"top -l 1 | grep 'CPU usage' | awk '{print $3}' | sed 's/%//'",
		)
		return `CPU Usage: ${stdout.trim()}%`
	} catch {
		return "CPU: N/A"
	}
}

async function getMacOSMemory(): Promise<string> {
	try {
		const { stdout } = await execAsync(
			'vm_stat | grep "Pages free\\|Pages active\\|Pages inactive\\|Pages speculative\\|Pages wired"',
		)
		const lines = stdout.trim().split("\n")
		let totalPages = 0
		let freePages = 0

		for (const line of lines) {
			const pages = parseInt(line.split(":")[1].trim().replace(".", ""))
			totalPages += pages
			if (line.includes("Pages free")) {
				freePages = pages
			}
		}

		const pageSize = 4096 // macOS page size
		const totalMB = Math.round((totalPages * pageSize) / 1024 / 1024)
		const freeMB = Math.round((freePages * pageSize) / 1024 / 1024)
		const usedMB = totalMB - freeMB

		return `Memory: ${usedMB}MB / ${totalMB}MB (${Math.round((usedMB / totalMB) * 100)}%)`
	} catch {
		return "Memory: N/A"
	}
}

async function getMacOSDisk(): Promise<string> {
	try {
		const { stdout } = await execAsync("df -h / | tail -1")
		const parts = stdout.trim().split(/\s+/)
		return `Disk: ${parts[2]} / ${parts[1]} (${parts[4]})`
	} catch {
		return "Disk: N/A"
	}
}

async function getMacOSUptime(): Promise<string> {
	try {
		const { stdout } = await execAsync("uptime")
		const match = stdout.match(/up\s+(.+?),\s+\d+\s+users?/)
		return match ? `Uptime: ${match[1]}` : "Uptime: N/A"
	} catch {
		return "Uptime: N/A"
	}
}

// Windows implementations
async function getWindowsCPU(): Promise<string> {
	try {
		const { stdout } = await execAsync(
			"wmic cpu get loadpercentage /value | findstr LoadPercentage",
		)
		const match = stdout.match(/LoadPercentage=(\d+)/)
		return match ? `CPU Usage: ${match[1]}%` : "CPU: N/A"
	} catch {
		return "CPU: N/A"
	}
}

async function getWindowsMemory(): Promise<string> {
	try {
		const [totalMem, availMem] = await Promise.all([
			execAsync(
				"wmic OS get TotalVisibleMemorySize /value | findstr TotalVisibleMemorySize",
			),
			execAsync(
				"wmic OS get FreePhysicalMemory /value | findstr FreePhysicalMemory",
			),
		])

		const totalMatch = totalMem.stdout.match(/TotalVisibleMemorySize=(\d+)/)
		const freeMatch = availMem.stdout.match(/FreePhysicalMemory=(\d+)/)

		if (totalMatch && freeMatch) {
			const totalMB = Math.round(parseInt(totalMatch[1]) / 1024)
			const freeMB = Math.round(parseInt(freeMatch[1]) / 1024)
			const usedMB = totalMB - freeMB
			return `Memory: ${usedMB}MB / ${totalMB}MB (${Math.round((usedMB / totalMB) * 100)}%)`
		}
		return "Memory: N/A"
	} catch {
		return "Memory: N/A"
	}
}

async function getWindowsDisk(): Promise<string> {
	try {
		const { stdout } = await execAsync(
			'wmic logicaldisk where caption="C:" get size,freespace /value',
		)
		const sizeMatch = stdout.match(/Size=(\d+)/)
		const freeMatch = stdout.match(/FreeSpace=(\d+)/)

		if (sizeMatch && freeMatch) {
			const totalGB = Math.round(parseInt(sizeMatch[1]) / 1024 / 1024 / 1024)
			const freeGB = Math.round(parseInt(freeMatch[1]) / 1024 / 1024 / 1024)
			const usedGB = totalGB - freeGB
			return `Disk: ${usedGB}GB / ${totalGB}GB (${Math.round((usedGB / totalGB) * 100)}%)`
		}
		return "Disk: N/A"
	} catch {
		return "Disk: N/A"
	}
}

async function getWindowsUptime(): Promise<string> {
	try {
		const { stdout } = await execAsync(
			"wmic OS get LastBootUpTime /value | findstr LastBootUpTime",
		)
		const match = stdout.match(/LastBootUpTime=(\d{14})/)

		if (match) {
			const bootTime = match[1]
			const bootDate = new Date(
				parseInt(bootTime.substring(0, 4)), // year
				parseInt(bootTime.substring(4, 6)) - 1, // month (0-indexed)
				parseInt(bootTime.substring(6, 8)), // day
				parseInt(bootTime.substring(8, 10)), // hour
				parseInt(bootTime.substring(10, 12)), // minute
				parseInt(bootTime.substring(12, 14)), // second
			)

			const uptime = Date.now() - bootDate.getTime()
			const days = Math.floor(uptime / (1000 * 60 * 60 * 24))
			const hours = Math.floor(
				(uptime % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
			)
			const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60))

			return `Uptime: ${days}d ${hours}h ${minutes}m`
		}
		return "Uptime: N/A"
	} catch {
		return "Uptime: N/A"
	}
}

export async function rebootSystem(): Promise<{
	success: boolean
	message: string
}> {
	const platform = process.platform

	try {
		switch (platform) {
			case "linux":
			case "darwin":
				await execAsync("sudo reboot")
				return {
					success: true,
					message: "Reboot command executed successfully",
				}
			case "win32":
				await execAsync("shutdown /r /t 10 /f")
				return { success: true, message: "Reboot scheduled for 10 seconds" }
			default:
				return {
					success: false,
					message: `Reboot not supported on platform: ${platform}`,
				}
		}
	} catch (error) {
		console.error("Reboot error:", error)
		return {
			success: false,
			message: `Failed to execute reboot command: ${error instanceof Error ? error.message : "Unknown error"}`,
		}
	}
}
