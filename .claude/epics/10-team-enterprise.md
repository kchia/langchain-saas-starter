# Epic 10: Team & Enterprise Features (Phase 2)

**Status**: Not Started
**Priority**: Low (Phase 2)
**Epic Owner**: Backend/Product Team
**Estimated Tasks**: 8
**Depends On**: Epic 9 (Security & Authentication)

---

## Overview

Build team collaboration and enterprise features including role-based access control (RBAC), team workspaces, shared pattern libraries, comprehensive audit logs, SSO integration, usage quotas, team analytics, and granular permission management.

---

## Goals

1. Implement role-based access control (RBAC) with custom roles
2. Create team workspaces for component organization
3. Build shared pattern libraries for teams
4. Extend audit logging with team-level visibility
5. Integrate SSO (SAML 2.0, OAuth providers)
6. Implement usage quotas and billing per team
7. Build team analytics dashboard
8. Add granular permission management

---

## Success Criteria

- ✅ RBAC supports admin, editor, viewer roles
- ✅ Teams can create private workspaces
- ✅ Pattern libraries shareable within teams
- ✅ Audit logs accessible to team admins
- ✅ SSO works with major providers (Google, Okta, Azure AD)
- ✅ Usage quotas enforced per team
- ✅ Analytics show team usage and cost
- ✅ Permissions granular to resource level
- ✅ Enterprise contracts supported (custom SLAs, support tiers)

---

## Tasks

### Task 1: Role-Based Access Control (RBAC)
**Acceptance Criteria**:
- [ ] Define role hierarchy:
  - **Owner**: Full access, billing, delete team
  - **Admin**: Manage members, settings, view billing
  - **Editor**: Generate/edit components, patterns
  - **Viewer**: Read-only access to components
- [ ] Support custom roles with granular permissions
- [ ] Implement permission checks on all endpoints
- [ ] Role inheritance (Admin includes Editor permissions)
- [ ] Assign roles to team members
- [ ] Change roles with audit trail
- [ ] Deny access with 403 for unauthorized actions

**Files**:
- `backend/src/auth/rbac.py`
- `backend/src/database/models.py` (Role, Permission models)

**RBAC Implementation**:
```python
from enum import Enum
from functools import wraps
from fastapi import HTTPException

class Role(str, Enum):
    OWNER = "owner"
    ADMIN = "admin"
    EDITOR = "editor"
    VIEWER = "viewer"

class Permission(str, Enum):
    # Component permissions
    COMPONENT_CREATE = "component:create"
    COMPONENT_READ = "component:read"
    COMPONENT_UPDATE = "component:update"
    COMPONENT_DELETE = "component:delete"

    # Pattern permissions
    PATTERN_CREATE = "pattern:create"
    PATTERN_READ = "pattern:read"
    PATTERN_UPDATE = "pattern:update"
    PATTERN_DELETE = "pattern:delete"

    # Team permissions
    TEAM_UPDATE = "team:update"
    TEAM_DELETE = "team:delete"
    MEMBER_INVITE = "member:invite"
    MEMBER_REMOVE = "member:remove"
    ROLE_ASSIGN = "role:assign"

    # Billing permissions
    BILLING_VIEW = "billing:view"
    BILLING_MANAGE = "billing:manage"

# Role permissions mapping
ROLE_PERMISSIONS = {
    Role.OWNER: [
        # All permissions
        Permission.COMPONENT_CREATE,
        Permission.COMPONENT_READ,
        Permission.COMPONENT_UPDATE,
        Permission.COMPONENT_DELETE,
        Permission.PATTERN_CREATE,
        Permission.PATTERN_READ,
        Permission.PATTERN_UPDATE,
        Permission.PATTERN_DELETE,
        Permission.TEAM_UPDATE,
        Permission.TEAM_DELETE,
        Permission.MEMBER_INVITE,
        Permission.MEMBER_REMOVE,
        Permission.ROLE_ASSIGN,
        Permission.BILLING_VIEW,
        Permission.BILLING_MANAGE,
    ],
    Role.ADMIN: [
        Permission.COMPONENT_CREATE,
        Permission.COMPONENT_READ,
        Permission.COMPONENT_UPDATE,
        Permission.COMPONENT_DELETE,
        Permission.PATTERN_CREATE,
        Permission.PATTERN_READ,
        Permission.PATTERN_UPDATE,
        Permission.PATTERN_DELETE,
        Permission.TEAM_UPDATE,
        Permission.MEMBER_INVITE,
        Permission.MEMBER_REMOVE,
        Permission.ROLE_ASSIGN,
        Permission.BILLING_VIEW,
    ],
    Role.EDITOR: [
        Permission.COMPONENT_CREATE,
        Permission.COMPONENT_READ,
        Permission.COMPONENT_UPDATE,
        Permission.PATTERN_CREATE,
        Permission.PATTERN_READ,
        Permission.PATTERN_UPDATE,
    ],
    Role.VIEWER: [
        Permission.COMPONENT_READ,
        Permission.PATTERN_READ,
    ]
}

class RBACService:
    def __init__(self, db):
        self.db = db

    async def check_permission(self, user_id: str, team_id: str,
                              permission: Permission) -> bool:
        """Check if user has permission in team."""
        # Get user's role in team
        membership = await self.db.query(TeamMember).filter(
            TeamMember.user_id == user_id,
            TeamMember.team_id == team_id
        ).first()

        if not membership:
            return False

        role = membership.role

        # Check if role has permission
        return permission in ROLE_PERMISSIONS.get(role, [])

    async def require_permission(self, user_id: str, team_id: str,
                                permission: Permission):
        """Raise exception if user lacks permission."""
        if not await self.check_permission(user_id, team_id, permission):
            raise HTTPException(
                status_code=403,
                detail=f"Missing required permission: {permission}"
            )

    async def get_user_permissions(self, user_id: str,
                                  team_id: str) -> list[Permission]:
        """Get all permissions for user in team."""
        membership = await self.db.query(TeamMember).filter(
            TeamMember.user_id == user_id,
            TeamMember.team_id == team_id
        ).first()

        if not membership:
            return []

        return ROLE_PERMISSIONS.get(membership.role, [])

# Decorator for protected endpoints
def require_permission(permission: Permission):
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Extract team_id from request
            team_id = kwargs.get('team_id')
            user = kwargs.get('user')

            if not team_id or not user:
                raise HTTPException(status_code=400, detail="Missing team_id or user")

            # Check permission
            await rbac_service.require_permission(
                user_id=user['sub'],
                team_id=team_id,
                permission=permission
            )

            return await func(*args, **kwargs)

        return wrapper
    return decorator

# Protected endpoint
@app.post('/api/v1/teams/{team_id}/components')
@require_permission(Permission.COMPONENT_CREATE)
async def create_component(
    team_id: str,
    request: CreateComponentRequest,
    user: dict = Depends(get_current_user)
):
    # User has permission, proceed
    pass
```

**Database Models**:
```python
class Team(Base):
    __tablename__ = "teams"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    slug = Column(String(100), unique=True, nullable=False)

    plan = Column(String(50), default="free")  # free, pro, enterprise
    created_at = Column(DateTime, default=datetime.utcnow)

    members = relationship("TeamMember", back_populates="team")

class TeamMember(Base):
    __tablename__ = "team_members"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(UUID(as_uuid=True), ForeignKey('teams.id'), nullable=False)
    user_id = Column(String(255), nullable=False)

    role = Column(Enum(Role), nullable=False, default=Role.VIEWER)

    joined_at = Column(DateTime, default=datetime.utcnow)
    invited_by = Column(String(255))

    team = relationship("Team", back_populates="members")

    __table_args__ = (
        UniqueConstraint('team_id', 'user_id', name='unique_team_member'),
    )
```

**Tests**:
- Permission checks work correctly
- Role hierarchy enforced
- 403 returned for unauthorized access
- Custom roles supported

---

### Task 2: Team Workspaces
**Acceptance Criteria**:
- [ ] Create team workspace with name and slug
- [ ] Workspace contains components, patterns, settings
- [ ] Private workspaces (team members only)
- [ ] Invite members via email
- [ ] Accept/decline invitations
- [ ] Remove team members (admins only)
- [ ] Transfer ownership
- [ ] Delete workspace (owner only, requires confirmation)
- [ ] Workspace settings (branding, defaults)

**Files**:
- `backend/src/services/team_service.py`
- `app/src/components/teams/TeamWorkspace.tsx`

**Team Service**:
```python
class TeamService:
    def __init__(self, db, email_service):
        self.db = db
        self.email = email_service

    async def create_team(self, name: str, owner_id: str) -> Team:
        """Create new team workspace."""
        # Generate slug from name
        slug = self._generate_slug(name)

        # Create team
        team = Team(
            name=name,
            slug=slug,
            plan="free"
        )
        self.db.add(team)

        # Add owner as member
        member = TeamMember(
            team_id=team.id,
            user_id=owner_id,
            role=Role.OWNER
        )
        self.db.add(member)

        await self.db.commit()

        return team

    async def invite_member(self, team_id: str, email: str,
                           role: Role, invited_by: str):
        """Invite member to team."""
        # Check if user exists
        user = await self.db.query(User).filter(
            User.email == email
        ).first()

        if user:
            # Create membership (pending)
            invitation = TeamInvitation(
                team_id=team_id,
                user_id=user.id,
                email=email,
                role=role,
                invited_by=invited_by,
                status="pending"
            )
        else:
            # Send invitation email to non-user
            invitation = TeamInvitation(
                team_id=team_id,
                email=email,
                role=role,
                invited_by=invited_by,
                status="pending"
            )

        self.db.add(invitation)
        await self.db.commit()

        # Send email
        await self.email.send_team_invitation(
            email=email,
            team_id=team_id,
            invitation_id=invitation.id
        )

        return invitation

    async def accept_invitation(self, invitation_id: str, user_id: str):
        """Accept team invitation."""
        invitation = await self.db.query(TeamInvitation).filter(
            TeamInvitation.id == invitation_id
        ).first()

        if not invitation or invitation.status != "pending":
            raise ValueError("Invalid invitation")

        # Create membership
        member = TeamMember(
            team_id=invitation.team_id,
            user_id=user_id,
            role=invitation.role,
            invited_by=invitation.invited_by
        )
        self.db.add(member)

        # Mark invitation as accepted
        invitation.status = "accepted"

        await self.db.commit()

    async def remove_member(self, team_id: str, user_id: str,
                           removed_by: str):
        """Remove member from team."""
        membership = await self.db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == user_id
        ).first()

        if not membership:
            raise ValueError("Member not found")

        # Cannot remove owner
        if membership.role == Role.OWNER:
            raise ValueError("Cannot remove owner")

        # Log removal
        await audit_logger.log(
            user_id=removed_by,
            action="member_removed",
            resource_type="team",
            resource_id=team_id,
            details={"removed_user_id": user_id}
        )

        await self.db.delete(membership)
        await self.db.commit()

    async def transfer_ownership(self, team_id: str, new_owner_id: str,
                                current_owner_id: str):
        """Transfer team ownership."""
        # Update current owner to admin
        current = await self.db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == current_owner_id
        ).first()
        current.role = Role.ADMIN

        # Update new owner
        new = await self.db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == new_owner_id
        ).first()
        new.role = Role.OWNER

        await self.db.commit()

    def _generate_slug(self, name: str) -> str:
        """Generate URL-safe slug from team name."""
        import re
        slug = name.lower()
        slug = re.sub(r'[^a-z0-9]+', '-', slug)
        slug = slug.strip('-')

        # Ensure uniqueness
        base_slug = slug
        counter = 1
        while self.db.query(Team).filter(Team.slug == slug).first():
            slug = f"{base_slug}-{counter}"
            counter += 1

        return slug
```

**Tests**:
- Team creation works
- Invitations sent and accepted
- Members removed correctly
- Ownership transfer works
- Slug generation unique

---

### Task 3: Shared Pattern Libraries
**Acceptance Criteria**:
- [ ] Create pattern libraries within teams
- [ ] Upload custom patterns to library
- [ ] Share patterns with team members
- [ ] Version pattern libraries
- [ ] Fork patterns for customization
- [ ] Merge pattern changes (with approval)
- [ ] Search team's pattern library
- [ ] Export/import pattern libraries
- [ ] Private vs public patterns

**Files**:
- `backend/src/services/pattern_library_service.py`
- `app/src/components/patterns/PatternLibrary.tsx`

**Pattern Library Service**:
```python
class PatternLibraryService:
    def __init__(self, db, qdrant_client):
        self.db = db
        self.qdrant = qdrant_client

    async def create_library(self, team_id: str, name: str,
                            description: str) -> PatternLibrary:
        """Create pattern library for team."""
        library = PatternLibrary(
            team_id=team_id,
            name=name,
            description=description,
            visibility="private"
        )

        self.db.add(library)
        await self.db.commit()

        # Create Qdrant collection for team patterns
        collection_name = f"patterns_team_{team_id}"
        self.qdrant.create_collection(
            collection_name=collection_name,
            vectors_config=VectorParams(size=1536, distance=Distance.COSINE)
        )

        return library

    async def add_pattern(self, library_id: str, pattern_data: dict,
                         user_id: str) -> Pattern:
        """Add pattern to library."""
        library = await self.db.query(PatternLibrary).filter(
            PatternLibrary.id == library_id
        ).first()

        # Create pattern record
        pattern = Pattern(
            library_id=library_id,
            name=pattern_data['name'],
            code=pattern_data['code'],
            metadata=pattern_data['metadata'],
            created_by=user_id,
            version="1.0.0"
        )

        self.db.add(pattern)
        await self.db.commit()

        # Index in Qdrant
        embedding = await self._generate_embedding(pattern_data)
        collection_name = f"patterns_team_{library.team_id}"

        self.qdrant.upsert(
            collection_name=collection_name,
            points=[
                PointStruct(
                    id=str(pattern.id),
                    vector=embedding,
                    payload={
                        "pattern_id": str(pattern.id),
                        "name": pattern.name,
                        "metadata": pattern.metadata
                    }
                )
            ]
        )

        return pattern

    async def fork_pattern(self, pattern_id: str, user_id: str) -> Pattern:
        """Fork pattern for customization."""
        original = await self.db.query(Pattern).filter(
            Pattern.id == pattern_id
        ).first()

        # Create copy
        forked = Pattern(
            library_id=original.library_id,
            name=f"{original.name} (fork)",
            code=original.code,
            metadata=original.metadata,
            created_by=user_id,
            parent_pattern_id=pattern_id,
            version="1.0.0"
        )

        self.db.add(forked)
        await self.db.commit()

        return forked

    async def search_library(self, team_id: str, query: str,
                            limit: int = 10) -> list[Pattern]:
        """Search team's pattern library."""
        # Generate query embedding
        query_embedding = await self._generate_embedding({"query": query})

        # Search Qdrant
        collection_name = f"patterns_team_{team_id}"
        results = self.qdrant.search(
            collection_name=collection_name,
            query_vector=query_embedding,
            limit=limit
        )

        # Fetch full pattern records
        pattern_ids = [r.payload['pattern_id'] for r in results]
        patterns = await self.db.query(Pattern).filter(
            Pattern.id.in_(pattern_ids)
        ).all()

        return patterns

    async def export_library(self, library_id: str) -> dict:
        """Export pattern library as JSON."""
        library = await self.db.query(PatternLibrary).filter(
            PatternLibrary.id == library_id
        ).first()

        patterns = await self.db.query(Pattern).filter(
            Pattern.library_id == library_id
        ).all()

        return {
            "library": {
                "name": library.name,
                "description": library.description,
                "version": library.version
            },
            "patterns": [
                {
                    "name": p.name,
                    "code": p.code,
                    "metadata": p.metadata,
                    "version": p.version
                }
                for p in patterns
            ]
        }

    async def import_library(self, team_id: str, data: dict,
                            user_id: str):
        """Import pattern library from JSON."""
        # Create library
        library = await self.create_library(
            team_id=team_id,
            name=data['library']['name'],
            description=data['library']['description']
        )

        # Import patterns
        for pattern_data in data['patterns']:
            await self.add_pattern(
                library_id=library.id,
                pattern_data=pattern_data,
                user_id=user_id
            )

        return library
```

**Tests**:
- Libraries created correctly
- Patterns added and indexed
- Search returns relevant patterns
- Fork creates independent copy
- Export/import preserves data

---

### Task 4: Team Audit Logs
**Acceptance Criteria**:
- [ ] Extend audit logging with team context
- [ ] Team admins can view team audit logs
- [ ] Filter logs by:
  - User
  - Action type
  - Date range
  - Resource type
- [ ] Export audit logs (CSV, JSON)
- [ ] Retention policy per plan (free: 30 days, pro: 90 days, enterprise: 1 year)
- [ ] Real-time log streaming for enterprise
- [ ] Immutable audit trail

**Files**:
- `backend/src/services/team_audit_service.py`
- `app/src/components/teams/AuditLogViewer.tsx`

**Team Audit Service**:
```python
class TeamAuditService:
    def __init__(self, db):
        self.db = db

    async def log_team_action(self, team_id: str, user_id: str,
                             action: str, details: dict = None):
        """Log team-level action."""
        log_entry = AuditLog(
            team_id=team_id,
            user_id=user_id,
            action=action,
            details=details,
            timestamp=datetime.utcnow()
        )

        self.db.add(log_entry)
        await self.db.commit()

    async def get_team_logs(self, team_id: str,
                           filters: dict = None,
                           limit: int = 100) -> list[AuditLog]:
        """Get audit logs for team."""
        query = self.db.query(AuditLog).filter(
            AuditLog.team_id == team_id
        )

        # Apply filters
        if filters:
            if 'user_id' in filters:
                query = query.filter(AuditLog.user_id == filters['user_id'])

            if 'action' in filters:
                query = query.filter(AuditLog.action == filters['action'])

            if 'start_date' in filters:
                query = query.filter(AuditLog.timestamp >= filters['start_date'])

            if 'end_date' in filters:
                query = query.filter(AuditLog.timestamp <= filters['end_date'])

        return query.order_by(AuditLog.timestamp.desc()).limit(limit).all()

    async def export_logs(self, team_id: str, format: str = "csv") -> str:
        """Export audit logs."""
        logs = await self.get_team_logs(team_id, limit=10000)

        if format == "csv":
            return self._export_csv(logs)
        elif format == "json":
            return self._export_json(logs)

    def _export_csv(self, logs: list[AuditLog]) -> str:
        """Export logs as CSV."""
        import csv
        import io

        output = io.StringIO()
        writer = csv.writer(output)

        # Header
        writer.writerow(['Timestamp', 'User ID', 'Action', 'Details'])

        # Data
        for log in logs:
            writer.writerow([
                log.timestamp.isoformat(),
                log.user_id,
                log.action,
                json.dumps(log.details) if log.details else ''
            ])

        return output.getvalue()

    async def apply_retention_policy(self, team_id: str):
        """Apply log retention policy based on team plan."""
        team = await self.db.query(Team).filter(Team.id == team_id).first()

        # Retention periods
        retention = {
            "free": 30,
            "pro": 90,
            "enterprise": 365
        }

        days = retention.get(team.plan, 30)
        cutoff_date = datetime.utcnow() - timedelta(days=days)

        # Delete old logs
        await self.db.query(AuditLog).filter(
            AuditLog.team_id == team_id,
            AuditLog.timestamp < cutoff_date
        ).delete()

        await self.db.commit()
```

**Tests**:
- Team logs filtered correctly
- Export formats valid
- Retention policy enforced
- Logs immutable

---

### Task 5: SSO Integration
**Acceptance Criteria**:
- [ ] Support SAML 2.0 for enterprise SSO
- [ ] Support OAuth providers:
  - Google Workspace
  - Microsoft Azure AD
  - Okta
  - Auth0
- [ ] Just-in-time (JIT) user provisioning
- [ ] Map SSO roles to application roles
- [ ] Support multiple SSO configurations per enterprise
- [ ] SSO settings UI for admins
- [ ] Test mode for SSO configuration

**Files**:
- `backend/src/auth/sso_handler.py`
- `app/src/components/settings/SSOConfig.tsx`

**SSO Implementation**:
```python
from onelogin.saml2.auth import OneLogin_Saml2_Auth

class SSOHandler:
    def __init__(self, db):
        self.db = db

    async def configure_saml(self, team_id: str, config: dict):
        """Configure SAML SSO for team."""
        sso_config = SSOConfiguration(
            team_id=team_id,
            provider="saml",
            settings=config,
            enabled=False  # Require testing first
        )

        self.db.add(sso_config)
        await self.db.commit()

        return sso_config

    async def initiate_saml_login(self, team_id: str, request):
        """Initiate SAML authentication."""
        config = await self._get_sso_config(team_id)

        saml_auth = OneLogin_Saml2_Auth(
            request,
            custom_base_path=config.settings
        )

        # Redirect to IdP
        return saml_auth.login()

    async def handle_saml_callback(self, team_id: str, request):
        """Handle SAML callback from IdP."""
        config = await self._get_sso_config(team_id)

        saml_auth = OneLogin_Saml2_Auth(
            request,
            custom_base_path=config.settings
        )

        saml_auth.process_response()

        if not saml_auth.is_authenticated():
            raise ValueError("SAML authentication failed")

        # Get user attributes
        attributes = saml_auth.get_attributes()
        email = attributes.get('email', [None])[0]
        name = attributes.get('name', [None])[0]
        roles = attributes.get('roles', [])

        # JIT provisioning
        user = await self._provision_user(email, name, team_id, roles)

        # Issue JWT token
        token = jwt_handler.create_access_token(
            user_id=user.id,
            email=user.email,
            roles=user.roles
        )

        return token

    async def _provision_user(self, email: str, name: str,
                             team_id: str, sso_roles: list[str]):
        """Just-in-time user provisioning."""
        # Check if user exists
        user = await self.db.query(User).filter(
            User.email == email
        ).first()

        if not user:
            # Create user
            user = User(
                email=email,
                name=name,
                sso_provider="saml"
            )
            self.db.add(user)
            await self.db.commit()

        # Add to team if not member
        membership = await self.db.query(TeamMember).filter(
            TeamMember.team_id == team_id,
            TeamMember.user_id == user.id
        ).first()

        if not membership:
            # Map SSO roles to application roles
            role = self._map_sso_role(sso_roles)

            membership = TeamMember(
                team_id=team_id,
                user_id=user.id,
                role=role
            )
            self.db.add(membership)
            await self.db.commit()

        return user

    def _map_sso_role(self, sso_roles: list[str]) -> Role:
        """Map SSO roles to application roles."""
        # Configurable mapping
        role_mapping = {
            "admin": Role.ADMIN,
            "editor": Role.EDITOR,
            "viewer": Role.VIEWER
        }

        for sso_role in sso_roles:
            if sso_role.lower() in role_mapping:
                return role_mapping[sso_role.lower()]

        # Default to viewer
        return Role.VIEWER

# API endpoints
@app.get('/auth/sso/{team_id}/login')
async def sso_login(team_id: str, request: Request):
    return await sso_handler.initiate_saml_login(team_id, request)

@app.post('/auth/sso/{team_id}/callback')
async def sso_callback(team_id: str, request: Request):
    token = await sso_handler.handle_saml_callback(team_id, request)
    return {"access_token": token}
```

**Tests**:
- SAML flow completes
- JIT provisioning works
- Role mapping correct
- Multiple providers supported

---

### Task 6: Usage Quotas & Billing
**Acceptance Criteria**:
- [ ] Define usage quotas per plan:
  - Free: 50 generations/month
  - Pro: 500 generations/month
  - Enterprise: Unlimited
- [ ] Track usage per team
- [ ] Enforce quotas with soft/hard limits
- [ ] Upgrade prompts when quota exceeded
- [ ] Billing integration (Stripe)
- [ ] Usage-based billing for overages
- [ ] Invoice generation
- [ ] Payment history

**Files**:
- `backend/src/services/billing_service.py`
- `app/src/components/billing/UsageQuota.tsx`

**Billing Service**:
```python
import stripe

class BillingService:
    def __init__(self, db):
        self.db = db
        stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

    async def check_quota(self, team_id: str) -> dict:
        """Check team's usage quota."""
        team = await self.db.query(Team).filter(Team.id == team_id).first()

        # Get current usage
        usage = await self._get_monthly_usage(team_id)

        # Get quota for plan
        quotas = {
            "free": 50,
            "pro": 500,
            "enterprise": float('inf')
        }

        quota = quotas.get(team.plan, 50)
        remaining = max(0, quota - usage)
        percentage = (usage / quota * 100) if quota < float('inf') else 0

        return {
            "plan": team.plan,
            "quota": quota if quota < float('inf') else "unlimited",
            "usage": usage,
            "remaining": remaining if quota < float('inf') else "unlimited",
            "percentage": percentage
        }

    async def enforce_quota(self, team_id: str):
        """Enforce usage quota before generation."""
        quota_info = await self.check_quota(team_id)

        if quota_info['remaining'] <= 0:
            raise HTTPException(
                status_code=402,
                detail="Usage quota exceeded. Please upgrade your plan."
            )

    async def _get_monthly_usage(self, team_id: str) -> int:
        """Get team's usage this month."""
        start_of_month = datetime.utcnow().replace(day=1, hour=0, minute=0, second=0)

        count = await self.db.query(Generation).filter(
            Generation.team_id == team_id,
            Generation.created_at >= start_of_month
        ).count()

        return count

    async def create_subscription(self, team_id: str,
                                 plan: str, payment_method: str):
        """Create Stripe subscription."""
        team = await self.db.query(Team).filter(Team.id == team_id).first()

        # Create Stripe customer if needed
        if not team.stripe_customer_id:
            customer = stripe.Customer.create(
                email=team.owner_email,
                metadata={'team_id': team_id}
            )
            team.stripe_customer_id = customer.id
            await self.db.commit()

        # Attach payment method
        stripe.PaymentMethod.attach(
            payment_method,
            customer=team.stripe_customer_id
        )

        # Create subscription
        subscription = stripe.Subscription.create(
            customer=team.stripe_customer_id,
            items=[{'price': self._get_price_id(plan)}],
            default_payment_method=payment_method
        )

        # Update team plan
        team.plan = plan
        team.stripe_subscription_id = subscription.id
        await self.db.commit()

        return subscription

    def _get_price_id(self, plan: str) -> str:
        """Get Stripe price ID for plan."""
        price_ids = {
            "pro": os.getenv('STRIPE_PRICE_PRO'),
            "enterprise": os.getenv('STRIPE_PRICE_ENTERPRISE')
        }
        return price_ids.get(plan)

# Webhook handler for Stripe
@app.post('/webhooks/stripe')
async def stripe_webhook(request: Request):
    payload = await request.body()
    sig_header = request.headers.get('stripe-signature')

    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, os.getenv('STRIPE_WEBHOOK_SECRET')
        )

        # Handle events
        if event['type'] == 'customer.subscription.deleted':
            # Downgrade team to free
            subscription_id = event['data']['object']['id']
            team = await db.query(Team).filter(
                Team.stripe_subscription_id == subscription_id
            ).first()

            if team:
                team.plan = "free"
                await db.commit()

        return {"status": "success"}

    except Exception as e:
        return {"error": str(e)}, 400
```

**Tests**:
- Quotas enforced correctly
- Billing integration works
- Subscription created
- Webhooks handled
- Overage charged

---

### Task 7: Team Analytics Dashboard
**Acceptance Criteria**:
- [ ] Dashboard shows:
  - Usage metrics (generations, validations)
  - Cost breakdown by operation
  - Component library size
  - Team member activity
  - Popular patterns
  - Error rates
  - Performance trends
- [ ] Filter by date range
- [ ] Export analytics data
- [ ] Real-time updates for enterprise
- [ ] Customizable dashboards

**Files**:
- `backend/src/services/analytics_service.py`
- `app/src/components/analytics/TeamDashboard.tsx`

**Analytics Service**:
```python
from datetime import datetime, timedelta

class AnalyticsService:
    def __init__(self, db):
        self.db = db

    async def get_team_analytics(self, team_id: str,
                                 start_date: datetime,
                                 end_date: datetime) -> dict:
        """Get team analytics for date range."""
        # Usage metrics
        generations = await self._count_generations(
            team_id, start_date, end_date
        )

        validations = await self._count_validations(
            team_id, start_date, end_date
        )

        # Cost breakdown
        costs = await self._calculate_costs(
            team_id, start_date, end_date
        )

        # Member activity
        activity = await self._get_member_activity(
            team_id, start_date, end_date
        )

        # Popular patterns
        patterns = await self._get_popular_patterns(
            team_id, start_date, end_date
        )

        # Error rates
        errors = await self._calculate_error_rates(
            team_id, start_date, end_date
        )

        return {
            "usage": {
                "generations": generations,
                "validations": validations
            },
            "costs": costs,
            "activity": activity,
            "patterns": patterns,
            "errors": errors
        }

    async def _count_generations(self, team_id: str,
                                start: datetime, end: datetime) -> int:
        """Count generations in date range."""
        return await self.db.query(Generation).filter(
            Generation.team_id == team_id,
            Generation.created_at >= start,
            Generation.created_at <= end
        ).count()

    async def _calculate_costs(self, team_id: str,
                              start: datetime, end: datetime) -> dict:
        """Calculate cost breakdown."""
        generations = await self.db.query(Generation).filter(
            Generation.team_id == team_id,
            Generation.created_at >= start,
            Generation.created_at <= end
        ).all()

        total_cost = sum(g.cost_total for g in generations)
        openai_cost = sum(g.cost_openai for g in generations)
        embeddings_cost = sum(g.cost_embeddings for g in generations)

        return {
            "total": total_cost,
            "openai": openai_cost,
            "embeddings": embeddings_cost,
            "breakdown": [
                {"operation": "generation", "cost": openai_cost},
                {"operation": "embeddings", "cost": embeddings_cost}
            ]
        }

    async def _get_member_activity(self, team_id: str,
                                   start: datetime, end: datetime):
        """Get member activity stats."""
        activity = await self.db.query(
            TeamMember.user_id,
            func.count(Generation.id).label('generations')
        ).join(Generation).filter(
            TeamMember.team_id == team_id,
            Generation.created_at >= start,
            Generation.created_at <= end
        ).group_by(TeamMember.user_id).all()

        return [
            {"user_id": a.user_id, "generations": a.generations}
            for a in activity
        ]
```

**Tests**:
- Analytics calculated correctly
- Date filtering works
- Cost breakdown accurate
- Activity tracked

---

### Task 8: Granular Permissions
**Acceptance Criteria**:
- [ ] Resource-level permissions (per component, pattern)
- [ ] Custom permission sets
- [ ] Permission inheritance
- [ ] Temporary permissions (time-limited)
- [ ] Permission templates
- [ ] Audit permission changes
- [ ] Bulk permission updates

**Files**:
- `backend/src/auth/permission_manager.py`

**Permission Manager**:
```python
class PermissionManager:
    def __init__(self, db):
        self.db = db

    async def grant_permission(self, user_id: str,
                              resource_type: str,
                              resource_id: str,
                              permission: Permission,
                              expires_at: datetime = None):
        """Grant resource-level permission."""
        perm = ResourcePermission(
            user_id=user_id,
            resource_type=resource_type,
            resource_id=resource_id,
            permission=permission,
            expires_at=expires_at
        )

        self.db.add(perm)
        await self.db.commit()

    async def check_resource_permission(self, user_id: str,
                                       resource_type: str,
                                       resource_id: str,
                                       permission: Permission) -> bool:
        """Check if user has permission on specific resource."""
        # Check direct permission
        perm = await self.db.query(ResourcePermission).filter(
            ResourcePermission.user_id == user_id,
            ResourcePermission.resource_type == resource_type,
            ResourcePermission.resource_id == resource_id,
            ResourcePermission.permission == permission
        ).first()

        if perm:
            # Check expiration
            if perm.expires_at and perm.expires_at < datetime.utcnow():
                return False
            return True

        # Check team-level permission
        # ... implementation

        return False
```

**Tests**:
- Permissions granted correctly
- Resource-level checks work
- Expiration enforced
- Inheritance works

---

## Dependencies

**Requires**:
- Epic 9: Security & Authentication

**Blocks**:
- Enterprise sales

---

## Technical Architecture

### Team Structure

```
Organization
     ↓
   Teams
     ↓
  Members (with Roles)
     ↓
  Workspaces
     ↓
  Components & Patterns
```

---

## Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| **Team Adoption** | 30% of paid users | Users in teams / Total users |
| **SSO Usage** | 80% of enterprise | Enterprise with SSO / Total enterprise |
| **Quota Compliance** | <1% overages | Users over quota / Total |
| **Permission Errors** | <0.5% | 403 responses / Total requests |

---

## Risks & Mitigation

| Risk | Impact | Mitigation |
|------|--------|------------|
| SSO complexity | High | Phased rollout, thorough testing |
| Permission bugs leak data | Critical | Comprehensive tests, security audit |
| Billing errors | High | Stripe integration testing, reconciliation |
| Quota enforcement bypassed | Medium | Multiple checks, monitoring |

---

## Definition of Done

- [ ] All 8 tasks completed with acceptance criteria met
- [ ] RBAC implemented with custom roles
- [ ] Team workspaces functional
- [ ] Shared pattern libraries work
- [ ] Team audit logs accessible
- [ ] SSO integrated with major providers
- [ ] Usage quotas enforced
- [ ] Team analytics dashboard complete
- [ ] Granular permissions implemented
- [ ] Enterprise features tested
- [ ] Documentation updated

---

## Related Epics

- **Depends On**: Epic 9
- **Blocks**: Enterprise sales
- **Related**: All epics (team features apply across product)

---

## Notes

**Enterprise Focus**: These features unlock enterprise sales. Prioritize based on customer demand.

**SSO Complexity**: SAML integration is complex. Start with OAuth providers (easier) before SAML.

**Gradual Rollout**: Roll out team features incrementally. Start with basic RBAC, then add SSO, then advanced permissions.
