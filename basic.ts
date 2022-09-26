
let age: number;
age = 12;

let userName: string;
userName = "Max"

let isInstructor: boolean;
isInstructor = true;

let hobbies: String[];
hobbies = ['Sports', 'Cooking'];

type Person = {
    name: string;
    age: number;
}

let person: Person

person = {
    name: 'Max',
    age: 32,
}

let people: Person[];

let course : string | number = 'React - The Complete Guide';
course = 12341;

function add(a: number, b: number) : number {
    return a + b;
}

function print(value:any){
    console.log(value);
}

export {};