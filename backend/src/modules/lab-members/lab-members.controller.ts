import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LabMembersService } from './lab-members.service';
import { CreateLabMemberDto } from './dto/create-lab-member.dto';
import { UpdateLabMemberDto } from './dto/update-lab-member.dto';
import { AssignPaymentBandDto } from './dto/assign-payment-band.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';

@ApiTags('Lab Members')
@Controller('lab-members')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class LabMembersController {
  constructor(private readonly labMembersService: LabMembersService) {}

  @Post()
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN)
  @ApiOperation({ summary: 'Create new lab member' })
  @ApiResponse({ status: 201, description: 'Lab member created successfully' })
  create(@Body() createLabMemberDto: CreateLabMemberDto) {
    return this.labMembersService.create(createLabMemberDto);
  }

  @Get()
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN)
  @ApiOperation({ summary: 'Get all lab members' })
  @ApiResponse({ status: 200, description: 'Lab members retrieved successfully' })
  findAll() {
    return this.labMembersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get lab member by ID' })
  @ApiResponse({ status: 200, description: 'Lab member retrieved successfully' })
  findOne(@Param('id') id: string) {
    return this.labMembersService.findById(id);
  }

  @Patch(':id')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN)
  @ApiOperation({ summary: 'Update lab member' })
  @ApiResponse({ status: 200, description: 'Lab member updated successfully' })
  update(@Param('id') id: string, @Body() updateLabMemberDto: UpdateLabMemberDto) {
    return this.labMembersService.update(id, updateLabMemberDto);
  }

  @Post(':id/payment-band')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN)
  @ApiOperation({ summary: 'Assign payment band to lab member' })
  @ApiResponse({ status: 201, description: 'Payment band assigned successfully' })
  assignPaymentBand(
    @Param('id') id: string,
    @Body() assignPaymentBandDto: AssignPaymentBandDto,
  ) {
    return this.labMembersService.assignPaymentBand(
      id,
      assignPaymentBandDto.payment_band_id,
      new Date(assignPaymentBandDto.assigned_from),
    );
  }
}
