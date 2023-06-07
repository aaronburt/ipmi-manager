import { PowerOption } from '../typescript/enum/PowerOption';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';

const promisedExec = promisify(exec);
type IpmiExpectedReturn = Promise<string | null | boolean>;

class IpmiController {
    public hostname: string = '';
    public username: string = '';
    public password: string = '';
    public loggerEnabled: boolean = false;
    public ipmiStarterSyntax: string = '';
    public ipmiPowerCommandSyntax: RegExp = /^ipmitool -H ([^\s"']*?) -I lanplus -U ([^\s"']*?) -P ([^\s"']*?) chassis power (on|off|status)$/;

    constructor(hostname: string, username: string, password: string, loggerEnabled: boolean = false){
        this.ipmiStarterSyntax = `ipmitool -H ${hostname} -I lanplus -U ${username} -P ${password}`;
        Object.assign(this, { hostname, username, password, loggerEnabled });
    }

    logger(msg: string): void {
        if(this.loggerEnabled){
            console.log(msg)
        }
    }

    async sleepForMS(ms: number): Promise<void> {
        return new Promise<void>((resolve) => {
            setTimeout(() => { resolve(); }, ms);
        });
    }

    async clearErrors(): Promise<void> {
        await this.execCommand(`${this.ipmiStarterSyntax} sel clear`);
    }

    async setFanSpeed(fanspeed: number): Promise<string | null> {
        try {
            await this.clearErrors();
            await this.execCommand(`${this.ipmiStarterSyntax} raw 0x30 0x30 0x01 0x00`);
            return await this.execCommand(`${this.ipmiStarterSyntax} raw 0x30 0x30 0x02 0xff 0x${fanspeed.toString(16)}`);
        } catch(err: any){
            this.logger(err);
            return null;
        }
    }

    handleSensorRecord(input: string){
        const lines = input.split('\n');
        const data = [];

        for(const line of lines){
            let [key, value, spare] = line.split('|');

            if(key !== undefined && value !== undefined){
                let keyTrim = key.replaceAll(' ', '');
                let valueTrim = value.replaceAll(' ', '');
                data.push({ [keyTrim]: valueTrim })
            }
        }

        return data;
    }
    

    async getSensorRecord(){
        try {
            const queryRecordResponse: string | null = await this.execCommand(`${this.ipmiStarterSyntax} sdr`);
            if(queryRecordResponse === null) return null;
            return this.handleSensorRecord(queryRecordResponse)
        } catch(err: any){
            this.logger(err);
            return null;
        }
    }


    async getChassisStatus(){
        try {

            const ipmiChassisStatusCommand: string = `${this.ipmiStarterSyntax} chassis status`;        
            const chassisStatus: string | null = await this.execCommand(ipmiChassisStatusCommand);

            if(chassisStatus === null){
                return null;
            }

            const chassisStatusArray: string[] = chassisStatus.trim().split('\n');
            return chassisStatusArray.map(item => { 
                const [key, value] = item.split(':') 
                return { [key.replaceAll(' ', '')]: value.replaceAll(' ', '') }
            
            });

        } catch(err: any){
            this.logger(err)
            return null;
        }
    }

    async setPowerState(option: PowerOption): Promise<string | null> {
        switch(option){
            case PowerOption.start:
                const powerStartCommand: string = `${this.ipmiStarterSyntax} chassis power on`;
                if(!this.ipmiPowerCommandSyntax.test(powerStartCommand)) throw new Error('Expected command is unexpected format');
                return await this.execCommand(powerStartCommand);
            
            case PowerOption.stop:
                const powerStopCommand: string = `${this.ipmiStarterSyntax} chassis power off`;
                if(!this.ipmiPowerCommandSyntax.test(powerStopCommand)) throw new Error('Expected command is unexpected format');
                return await this.execCommand(powerStopCommand);

            default:
                return null;
        }
    }

    async getPowerState(): Promise<boolean> {
        const powerStatusCommand: string = `${this.ipmiStarterSyntax} chassis power status`;
        if(!this.ipmiPowerCommandSyntax.test(powerStatusCommand)) throw new Error('Expected command is unexpected format');
        const ipmiResponse: string | null = await this.execCommand(powerStatusCommand);
        return ipmiResponse?.includes('Power is on') ? true : false;
    }

    async execCommand(command: string): Promise<string | null>  {
        try {
            if(!command.startsWith(this.ipmiStarterSyntax)) throw new Error('Injection?');
            const { stdout, stderr } = await promisedExec(command);
            if(stderr) throw new Error(stderr);
            return stdout;
        } catch(err: any){
            this.logger(err);
            return null;
        }
    }
}

export default IpmiController;