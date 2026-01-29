import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { CreateEmployeeDto } from "./dto/create-employee.dto";
import { Employee } from "./entities/employee.entity";
import * as fs from "fs";
import * as path from "path";
import PizZip from "pizzip";
import Docxtemplater from "docxtemplater";

@Injectable()
export class EmployeesService {
  constructor(
    @InjectRepository(Employee)
    private employeesRepository: Repository<Employee>,
  ) {}

  create(createEmployeeDto: CreateEmployeeDto) {
    const employee = this.employeesRepository.create(createEmployeeDto);
    return this.employeesRepository.save(employee);
  }

  findAll() {
    return this.employeesRepository.find();
  }

  findOne(id: string) {
    return this.employeesRepository.findOneBy({ id });
  }

  async update(id: string, updateEmployeeDto: any) {
    await this.employeesRepository.update(id, updateEmployeeDto);
    return this.findOne(id);
  }

  async updateAvatar(id: string, avatarPath: string) {
    await this.employeesRepository.update(id, { avatar: avatarPath });
    return this.findOne(id);
  }

  async exportProfile(id: string): Promise<Buffer> {
    const employee = await this.findOne(id);
    if (!employee) {
      throw new Error("Employee not found");
    }

    // Load the docx file as binary content
    const content = fs.readFileSync(
      path.resolve(__dirname, "../../templates/profile-template.docx"),
      "binary",
    );

    const zip = new PizZip(content);
    const doc = new Docxtemplater(zip, {
      paragraphLoop: true,
      linebreaks: true,
    });

    // Render the document
    doc.render({
      ...employee,
      gender: employee.gender,
      dob: employee.dob
        ? new Date(employee.dob).toLocaleDateString("vi-VN")
        : "",
      // Add more formatted fields here
    });

    return doc.getZip().generate({
      type: "nodebuffer",
      compression: "DEFLATE",
    });
  }

  remove(id: string) {
    return this.employeesRepository.delete(id);
  }
}
