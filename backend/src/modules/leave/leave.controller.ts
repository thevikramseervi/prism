import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { LeaveService } from './leave.service';
import { CreateLeaveRequestDto } from './dto/create-leave-request.dto';
import { ApproveLeaveDto } from './dto/approve-leave.dto';
import { RejectLeaveDto } from './dto/reject-leave.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles, UserRole } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';

@ApiTags('Leave Management')
@Controller('leave')
@UseGuards(JwtAuthGuard, RolesGuard)
@ApiBearerAuth('JWT-auth')
export class LeaveController {
  constructor(private readonly leaveService: LeaveService) {}

  @Post('request')
  @Roles(UserRole.LAB_MEMBER, UserRole.LAB_ADMIN, UserRole.SUPER_ADMIN)
  @ApiOperation({ summary: 'Create leave request' })
  createRequest(@Body() createDto: CreateLeaveRequestDto, @CurrentUser('id') userId: string) {
    // In real implementation, get lab_member_id from user
    return this.leaveService.createLeaveRequest(createDto, createDto.lab_member_id);
  }

  @Get('member/:memberId')
  @ApiOperation({ summary: 'Get leave requests for a lab member' })
  getRequestsForMember(@Param('memberId') memberId: string) {
    return this.leaveService.getLeaveRequestsForMember(memberId);
  }

  @Get('pending')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN)
  @ApiOperation({ summary: 'Get all pending leave requests' })
  getPendingRequests() {
    return this.leaveService.getPendingRequests();
  }

  @Post(':requestId/approve')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN)
  @ApiOperation({ summary: 'Approve leave request' })
  approveRequest(@Param('requestId') requestId: string, @CurrentUser('id') adminUserId: string) {
    return this.leaveService.approveLeaveRequest(requestId, adminUserId);
  }

  @Post(':requestId/reject')
  @Roles(UserRole.SUPER_ADMIN, UserRole.LAB_ADMIN)
  @ApiOperation({ summary: 'Reject leave request' })
  rejectRequest(
    @Param('requestId') requestId: string,
    @Body() rejectDto: RejectLeaveDto,
    @CurrentUser('id') adminUserId: string,
  ) {
    return this.leaveService.rejectLeaveRequest(requestId, rejectDto.rejection_reason, adminUserId);
  }

  @Get('balance/:memberId')
  @ApiOperation({ summary: 'Get leave balance for a lab member' })
  getBalance(@Param('memberId') memberId: string) {
    return this.leaveService.getLeaveBalance(memberId);
  }
}
