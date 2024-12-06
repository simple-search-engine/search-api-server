import { Controller, Post, Body } from '@nestjs/common';
import { EnrollTextDto } from './dto/enroll-text.dto';
import { DocumentService } from './document.service';

interface EnrollTextResponse {
    response: string;
}

@Controller()
export class DocumentController {
    constructor(private documentService: DocumentService) {}
    @Post('/enrollText')
    async enrollText(@Body() dto: EnrollTextDto): Promise<EnrollTextResponse> {
        this.documentService.enrollText(dto.text);
        return { "response": "success" };
    }
}