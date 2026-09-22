import { Request, Response } from "express";
import prisma from "../config/prisma.js";
import bcrypt from "bcryptjs"
import { generateToken } from "../config/generateToken.js";
import { error } from "node:console";
import { AuthRequest } from "../types/index.js";



export const register=async(req:Request,res:Response):Promise<void>=>{
    const PUBLIC_DOMAINS = ["gmail.com", "yahoo.com", "hotmail.com", "outlook.com", "icloud.com"];
try {
     const{name,email,password,organizationName} = req.body;

    if(!name || !email || !password || !organizationName){
        res.status(400).json({error:"All fields are required!"});
        return;
    }
    const existing = await prisma.user.findUnique({where:{email}})
    if(existing){
        res.status(400).json({error:"Email already in use"});
        return;
    }

    const hashed = await bcrypt.hash(password,10);

    const domain = email.split("@")[1].toLowerCase();
    const isPublicDomain = PUBLIC_DOMAINS.includes(domain);

    const existingOrg = isPublicDomain ? null : await prisma.organization.findFirst({
        where:{domain}
    }) 

    const orgDomain = isPublicDomain
    ? `${email.replace("@", "-at-")}-${Date.now()}.personal`
    : domain; 

    let user;
   if(existingOrg){
     user =  await prisma.user.create({
        data:{
            name,
            email,
            password:hashed,
            role:"member",
            organizationId:existingOrg.id
        },
        include:{organization:true}
    })
   } else {
    const org = await prisma.organization.create({
        data: {
          name: organizationName,
          domain:orgDomain, 
          users: {
            create: {
              name,
              email,
              password: hashed,
              role: "admin",
            },
          },
        },
        include: { users: true },
      });
      user = { ...org.users[0], organization: org };
   }
    
    const token = generateToken({
      id:user.id,
      email:user.email,
      role:user.role,
      organizationId:user?.organizationId
    })
    res.status(201).json({
        token,
        user:{
            id:user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            organizationId: user.organizationId,
            organizationName: user.organization.name,
        }
    })

} catch (error) {
    console.error("register error:", error);
    res.status(500).json({error:"Registration failed"})
}   

}
export const login=async(req:Request,res:Response):Promise<void>=>{
    try {
        const{email,password} = req.body;
        const user = await prisma.user.findUnique({
        where:{email},
        include:{organization:true}
    })
    if(!user){
        res.status(401).json({error:"user not found"})
        return
    }
    const match = await bcrypt.compare(password, user.password)
    if(!match){
        res.status(401).json({error:"Invalid credentials"});
        return;
    }
    const token = generateToken({id:user.id,email:user.email,role:user.role,organizationId:user.organizationId});
    res.status(201).json({token,user:{ id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        organizationId: user.organizationId,
        organizationName: user.organization.name,}})
    } catch (error) {
        res.status(500).json({error:"Faied to log in"})
    }
}
export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { organization: true },
    });

    if (!user) {
      res.status(404).json({ error: "User not found." });
      return;
    }

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      organizationName: user.organization.name,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch user." });
  }
};