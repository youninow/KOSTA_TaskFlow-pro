import logging
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response
from sqlalchemy.orm import Session

from database import get_db
from models import Task
from schemas import TaskCreate, TaskDetail, TaskSummary, TaskUpdate

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/tasks", tags=["tasks"])


@router.post("", response_model=TaskDetail, status_code=201)
def create_task(payload: TaskCreate, db: Session = Depends(get_db)):
    """태스크 생성"""
    task = Task(
        title=payload.title,
        description=payload.description,
        status=payload.status,
        due_at=payload.due_at,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    logger.info("태스크 생성 완료: id=%s", task.id)
    return task


@router.get("", response_model=List[TaskSummary])
def list_tasks(db: Session = Depends(get_db)):
    """태스크 목록 조회 — description 제외, created_at DESC 정렬"""
    tasks = db.query(Task).order_by(Task.created_at.desc()).all()
    return tasks


@router.get("/{task_id}", response_model=TaskDetail)
def get_task(task_id: int, db: Session = Depends(get_db)):
    """태스크 단건 조회 — description 포함"""
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="태스크를 찾을 수 없습니다")
    return task


@router.put("/{task_id}", response_model=TaskDetail)
def update_task(task_id: int, payload: TaskUpdate, db: Session = Depends(get_db)):
    """태스크 부분 수정 — 전달된 필드만 갱신"""
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="태스크를 찾을 수 없습니다")

    update_data = payload.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)

    task.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(task)
    logger.info("태스크 수정 완료: id=%s", task.id)
    return task


@router.delete("/{task_id}", status_code=204)
def delete_task(task_id: int, db: Session = Depends(get_db)):
    """태스크 삭제 — 성공 시 204 No Content"""
    task = db.get(Task, task_id)
    if task is None:
        raise HTTPException(status_code=404, detail="태스크를 찾을 수 없습니다")

    db.delete(task)
    db.commit()
    logger.info("태스크 삭제 완료: id=%s", task_id)
    return Response(status_code=204)
