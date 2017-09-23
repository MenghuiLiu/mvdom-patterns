
// This is just a fake os-top so that we can have it cross platform. This could be the mock of a real os-top

// --------- Types --------- //
// e.g., {used: 14000, wired: 2490, unused: 1816, time: 1506116422890}
export interface MemStat {
	total: number,
	used: number
}

// e.g., {user: 2.77, sys: 3.3, idle: 93.92, time: 1506116422890
export interface CpuStat {
	user: number,
	sys: number,
	idle: number
}

export interface Process {
	name: string,
	cpu: number,
	mem: number
}
// --------- /Types --------- //

// --------- Module API --------- //
export async function memStat(): Promise<MemStat> {
	// change the original
	lastMemStat.used = randomChange(lastMemStat.used, { minVal: 3000, maxVal: 14000, maxPct: 1 / 5 });
	// return a copy
	return Object.assign({}, lastMemStat);
}

export async function cpuStat(): Promise<CpuStat> {
	// change the original
	lastCpuStat.user = randomChange(lastCpuStat.user, { maxVal: 30 });
	lastCpuStat.sys = randomChange(lastCpuStat.sys, { maxVal: 30 });
	lastCpuStat.idle = 100 - lastCpuStat.user - lastCpuStat.sys;

	// return a copy
	return Object.assign({}, lastCpuStat);
}

export async function processes(): Promise<Process[]> {
	// update the lastProcesses values, but return a copy of the array/items
	var processes = lastProcesses.map(p => {
		if (Math.round(Math.random())) { // ~50% chance to change the process 
			// change the original process
			p.cpu = randomChange(p.cpu);
			p.mem = Math.round(randomChange(p.mem));
		}
		return Object.assign({}, p);
	});
	return lastProcesses;
}
// --------- /Module API --------- //

// --------- Fake Initial Data --------- //
// in MB
var lastMemStat: MemStat = {
	total: 16000,
	used: 9000
}

var lastCpuStat: CpuStat = {
	user: 2.7,
	sys: 3.3,
	idle: 94
}

const processes_names = ['node', 'agetty', 'ata_sff', 'atd', 'auditd', 'bash', 'bioset', 'crond', 'crypto', 'dbus-daemon', 'deferwq', 'dhclient', 'ext4-rsv-conver', 'fsnotify_mark', 'init', 'ipv6_addrconf',
	'jbd2/xvda1-8', 'jbd2/xvdb-8', 'kauditd', 'kblockd', 'kdevtmpfs', 'khelper', 'khugepaged', 'khungtaskd', 'kintegrityd', 'kpsmoused', 'ksmd', 'ksoftirqd/0', 'kswapd0', 'kthreadd', 'kthrotld', 'kworker/u30:2', 'md', 'migration/0', 'mingetty', 'netns', 'node', 'npm', 'npm', 'ntpd', 'perf',
	'postmaster', 'rcu_bh', 'rcu_sched', 'rngd', 'rpc.statd', 'rpcbind', 'rsyslogd', 'screen', 'screen', 'screen', 'scsi_eh_0', 'scsi_eh_1', 'scsi_tmf_0', 'scsi_tmf_1', 'ssh-agent', 'sshd', 'top', 'udevd', 'udevd', 'udevd', 'writeback', 'xenbus', 'xenwatch'];

// we initiliaze the process
const lastProcesses: Process[] = processes_names.map(name => {
	var cpu = randomChange(Math.random() / 5, { maxVal: 10, maxPct: 1 / 2 }); // change from a random value from 0 to .2
	var mem = Math.round(randomChange(Math.random() * 800, { maxVal: 400 })); // 0 to 800MB
	return { name, cpu, mem };
});
// --------- /Fake Initial Data --------- //


/** Do a random change (0 to 20% change), and returned a 2 digit max digit precision number */
function randomChange(val: number, opts?: { maxVal?: number, minVal?: number, maxPct?: number }): number {
	var dir: number; // direction of the change (up or down)
	// if we have a max value, then, we make the dir down if over.
	if (opts && opts.maxVal != null && val >= opts.maxVal) {
		dir = -1;
	} else if (opts && opts.minVal != null && val <= opts.minVal) {
		dir = 1;
	} else {
		dir = (Math.random() < .5) ? -1 : 1; //~50% up or down
	}

	var maxPct = (opts && opts.maxPct != null) ? opts.maxPct : (1 / 5);

	var change = Math.random() * maxPct;

	// we add or substract the change
	var newVal = val + val * dir * change;

	// make it 2 digit precision max and remove the .00
	var newValStr = newVal.toFixed(2);
	newValStr = (newValStr.endsWith(".00")) ? newValStr.slice(0, -3) : newValStr;
	newVal = parseFloat(newValStr);
	return (newVal < 0) ? 0 : newVal;
}