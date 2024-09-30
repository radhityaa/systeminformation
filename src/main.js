import esi from 'systeminformation'
import express from 'express'
import { Server } from 'socket.io'
import http from 'http'

const io = new Server(3001, {
    cors: {
        origin: "*"
    }
})

async function getSystemStats() {
    const cpu = await esi.cpu()
    const speed = await esi.cpuCurrentSpeed()
    const mem = await esi.mem()
    const disk = await esi.fsSize()
    const temp = await esi.cpuTemperature()
    const currentLoad = await esi.currentLoad()
    const os = await esi.osInfo()
    const uuid = await esi.uuid()
    const processes = await esi.processes()

    return {
        cpu: {
            processors: cpu.processors,
            manufacturer: cpu.manufacturer,
            brand: cpu.brand,
            cores: cpu.cores,
            physicalCores: cpu.physicalCores,
            socket: cpu.socket,
            cache: cpu.cache,
            usage: currentLoad.currentLoad.toFixed(2) + '%',
        },
        speed: {
            avg: speed.avg,
            min: speed.min,
            max: speed.max,
            cores: speed.cores,
        },
        temp: {
            main: temp.main,
            cores: temp.cores,
            max: temp.max,
            socket: temp.socket,
            chipset: temp.chipset,
        },
        memory: {
            total: (mem.total / (1024 ** 3)).toFixed(2) + ' GB',
            free: (mem.free / (1024 ** 3)).toFixed(2) + ' GB',
            used: (mem.used / (1024 ** 3)).toFixed(2) + ' GB',
        },
        disk: {
            total: (disk[0].size / (1024 ** 3)).toFixed(2) + ' GB',
            used: (disk[0].used / (1024 ** 3)).toFixed(2) + ' GB',
            available: ((disk[0].size - disk[0].used) / (1024 ** 3)).toFixed(2) + ' GB',
        },
        os: {
            platform: os.platform,
            distro: os.distro,
            release: os.release,
            kernel: os.kernel,
            arch: os.arch,
        },
        uuid: {
            os: uuid.os,
            hardware: uuid.hardware,
            macs: uuid.macs,
        },
        currentLoad: {
            avgLoad: currentLoad.avgLoad,
            currentLoad: currentLoad.currentLoad.toFixed(2) + '%',
            currentLoadUser: currentLoad.currentLoadUser.toFixed(2) + '%',
        },
        processes: {
            all: processes.all,
            running: processes.running,
            blocked: processes.blocked,
            sleeping: processes.sleeping,
            unknown: processes.unknown,
            unknown: processes.unknown,
            list: processes.list,
        }
    };
}

// API endpoint untuk mendapatkan statistik sistem
io.on("connection", (socket) => {
    console.info(`Socket.IO connected`)
    socket.emit("connected", "Socket.IO connected")

    const intervalId = setInterval(async () => {
        const stats = await getSystemStats()
        socket.emit("systemStats", stats)
    }, 5000)

    socket.on('disconnect', () => {
        console.log('Client Disconnected')
        clearInterval(intervalId)
    })
})