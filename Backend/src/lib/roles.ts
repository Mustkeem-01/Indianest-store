import type {UserRole} from "../DB/schema.ts"

const VALID:readonly UserRole[] = ['customer','support','admin'];

export function parseRole(value:unknown){
    if(typeof value === 'string' && (VALID as readonly string[]).includes(value)){
        return value as UserRole;
    }
    return "customer" ;
}

export function isAdmin(role:UserRole){
    return role === 'admin';
}

export function isSupport(role:UserRole){
    return role === 'support' || role === 'admin';
}