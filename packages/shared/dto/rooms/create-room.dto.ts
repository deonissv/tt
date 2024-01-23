import { ApiProperty } from '@nestjs/swagger';
import { type PlaygroundStateSave } from '@shared/PlaygroundState';

export class CreateRoomDto {
  @ApiProperty()
  playground?: PlaygroundStateSave;
}
