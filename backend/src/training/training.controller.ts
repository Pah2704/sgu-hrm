import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseInterceptors, UploadedFile, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TrainingService } from './training.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

@Controller('training')
@UseGuards(JwtAuthGuard)
export class TrainingController {
    constructor(private readonly trainingService: TrainingService) { }

    // --- Levels & Fields ---
    @Get('levels')
    getLevels() {
        return this.trainingService.getLevels();
    }

    @Get('fields')
    getFields() {
        return this.trainingService.getFields();
    }

    // --- Degrees ---
    @Post('degrees')
    createDegree(@Body() data: any) {
        return this.trainingService.createDegree(data);
    }

    @Get('degrees')
    getDegrees(@Query('employeeId') employeeId: string) {
        return this.trainingService.getDegreesByEmployee(employeeId);
    }

    @Patch('degrees/:id')
    updateDegree(@Param('id') id: string, @Body() data: any) {
        return this.trainingService.updateDegree(id, data);
    }

    @Delete('degrees/:id')
    deleteDegree(@Param('id') id: string) {
        return this.trainingService.deleteDegree(id);
    }

    // --- Certificates ---
    @Post('certificates')
    createCertificate(@Body() data: any) {
        return this.trainingService.createCertificate(data);
    }

    @Get('certificates')
    getCertificates(@Query('employeeId') employeeId: string) {
        return this.trainingService.getCertificatesByEmployee(employeeId);
    }

    @Patch('certificates/:id')
    updateCertificate(@Param('id') id: string, @Body() data: any) {
        return this.trainingService.updateCertificate(id, data);
    }

    @Delete('certificates/:id')
    deleteCertificate(@Param('id') id: string) {
        return this.trainingService.deleteCertificate(id);
    }

    // --- File Upload ---
    @Post('upload')
    @UseInterceptors(FileInterceptor('file', {
        storage: diskStorage({
            destination: './uploads/training',
            filename: (req, file, cb) => {
                const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
                cb(null, `${randomName}${extname(file.originalname)}`);
            },
        }),
    }))
    uploadFile(@UploadedFile() file: Express.Multer.File) {
        return { url: `/uploads/training/${file.filename}` };
    }
}
