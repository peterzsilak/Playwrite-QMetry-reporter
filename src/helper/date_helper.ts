export class DateHelper {

    private months: string[] = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // 👇️ DD/MMM/YYYY hh:mm
    public formatDateTime(date: Date): string {
        return (
            [
                this.padTo2Digits(date.getDate()),
                this.months[date.getMonth()],
                date.getFullYear(),
            ].join('/') +
            ' ' +
            [
                this.padTo2Digits(date.getHours()),
                this.padTo2Digits(date.getMinutes())
            ].join(':')
        );
    }

    // 👇️ Tomorrow's date in format DD/MMM/YYYY hh:mm
    public getTomorrowsDateTime(): string {
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return this.formatDateTime(tomorrow);
    }

    // 👇️ in format DD-MM-YYYY
    public getTodayDate(): string {
        const today = new Date();
        return this.formatDate(today);
    }

    // 👇️ Future or past date in format DD-MM-YYYY
    public getDifferentDate(year?: number, month?: number, day?: number): string {
        const today = new Date();
        const future = new Date(today);
        future.setFullYear(future.getFullYear() + year);
        future.setMonth(future.getMonth() + month)
        future.setDate(future.getDate() + day);
        return this.formatDate(future);
    }

    // 👇️ 1666080978805
    public getUnixTime(): number {
        const date = new Date();
        return date.valueOf();
    }

    // 👇️ DD-MM-YYYY
    public formatDate(date: Date): string {
        return [
            this.padTo2Digits(date.getDate()),
            this.padTo2Digits(date.getMonth() + 1),
            date.getFullYear(),
        ].join('-');
    }

    // 👇️ 05
    private padTo2Digits(number: number): string {
        return String(number).padStart(2, '0');
    }

    public generateCoupleDateList(): string[] {
        const birthdays: Date[] = [];
        const couple: number = 2;

        for (let i:number = 0; i < couple; i++) {
            const secondBirthday: Date = this.generateAdultBirthday();
            birthdays.push(secondBirthday);
        }

        this.orderDatesAscend(birthdays);

        return birthdays.map(date => this.formatDate(date));
    }

    public generateFamilyDateList(numberOfBirthdays: number): string[] {
        const birthdays: Date[] = [];

        for (let i: number = 0; i < numberOfBirthdays; i++) {
            if (i < 2){
                const adultOrChildBirthday: Date = this.generateRandomBirthday();
                birthdays.push(adultOrChildBirthday);
            } else {
                const childBirthday: Date = this.generateChildBirthday();
                birthdays.push(childBirthday);
            }
        }
        this.orderDatesAscend(birthdays);

        return birthdays.map(date => this.formatDate(date));
    }

    private orderDatesAscend(dateList: Date[]) {
        // Sort by Date objects in ascending order
        dateList.sort((a: Date, b: Date) => a.getTime() - b.getTime());
    }

    private generateRandomBirthday(): Date {
        return Math.random() < 0.5 ? this.generateAdultBirthday() : this.generateChildBirthday();
    }

    private generateAdultBirthday(): Date {
        const maxYearsAgoAdult: number = 99;
        const minYearsAgoAdult: number = 15;
        return this.getDateBetween(minYearsAgoAdult, maxYearsAgoAdult);
    }

    private generateChildBirthday(): Date {
        const maxYearsAgoChild: number = 27;
        const minYearsAgoChild: number = 0;
        return this.getDateBetween(minYearsAgoChild, maxYearsAgoChild);
    }

    private getDateBetween(minYearsAgoAdult: number, maxYearsAgoAdult: number) {
        const today: Date = new Date();
        const days: number = 365;
        const hours: number = 24;
        const minutes: number = 60;
        const seconds: number = 60;
        const milliseconds: number = 1000;
        const one_day:number = hours * minutes * seconds * milliseconds;
        const maxYearsAgo: number = Math.max(minYearsAgoAdult, Math.floor(Math.random() * maxYearsAgoAdult));
        return new Date(today.getTime() - maxYearsAgo * days * hours * minutes * seconds * milliseconds + one_day);
    }

}
