import {
    HttpException,
    Injectable,
    InternalServerErrorException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

interface SttResponse {
    text: string;
}

@Injectable()
export class SttService {
    private readonly logger = new Logger('CLOVA SPEECH');
    private readonly baseUrl: string;
    private readonly secretKey: string;

    constructor(private readonly config: ConfigService) {
        this.baseUrl = this.config.getOrThrow('CLOVA_SPEECH_API_URL') as string;
        this.secretKey = this.config.getOrThrow('CLOVA_SPEECH_API_KEY') as string;
    }

    async transform(file: Express.Multer.File): Promise<string> {
        try {
            const formData = this.buildFormData(file);
            const response = await fetch(this.baseUrl, {
                method: 'POST',
                body: formData,
                headers: {
                    'X-CLOVASPEECH-API-KEY': this.secretKey,
                },
            });

            if (!response.ok) {
                this.logger.error(
                    `CLOVA Speech 사용에 문제가 발생했습니다. ${response.statusText}`,
                );
                throw new HttpException(
                    {
                        status: response.status,
                        error: 'CLOVA Speech 사용에 문제가 발생했습니다.',
                        message: response.statusText,
                    },
                    response.status,
                );
            }

            const data = (await response.json()) as SttResponse;
            const transformResult = data.text;
            return transformResult;
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            this.logger.error(`CLOVA Speech 네트워크 오류: ${error}`);
            throw new InternalServerErrorException(
                'CLOVA Speech 서비스 연결 중 오류가 발생했습니다.',
            );
        }
    }

    private buildFormData(file: Express.Multer.File) {
        const formData = new FormData();
        //음성 파일 폼데이터에 담기
        const mediaBlob = new Blob([new Uint8Array(file.buffer)], {
            type: file.mimetype,
        });
        formData.append('media', mediaBlob, file.originalname || 'audio.m4a');

        const diarization = { enable: false };
        const params = {
            language: 'ko-KR',
            completion: 'sync',
            callback: '',
            fullText: true,
            diarization: diarization,
        };
        formData.append('params', JSON.stringify(params));
        formData.append('type', 'application/json');
        return formData;
    }
}
