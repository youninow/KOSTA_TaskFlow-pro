from datetime import datetime
from typing import Optional

from pydantic import BaseModel, Field, field_validator

from models import TaskStatus


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.todo
    due_at: Optional[datetime] = None

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("title은 공백만으로 구성될 수 없습니다")
        return value


class TaskUpdate(BaseModel):
    """부분 수정 허용 — 보내지 않은 필드는 기존 값 유지"""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    due_at: Optional[datetime] = None

    @field_validator("title")
    @classmethod
    def title_not_blank(cls, value: Optional[str]) -> Optional[str]:
        if value is not None and not value.strip():
            raise ValueError("title은 공백만으로 구성될 수 없습니다")
        return value


class TaskSummary(BaseModel):
    """목록 조회용 — description 제외"""
    id: int
    title: str
    status: TaskStatus
    due_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class TaskDetail(BaseModel):
    """단건·생성·수정 응답용 — description 포함"""
    id: int
    title: str
    description: Optional[str]
    status: TaskStatus
    due_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
