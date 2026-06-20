<div id="page-header" class="page-header page-header-light">
    <div class="page-header-content header-elements-md-inline">
        <div class="page-title d-flex align-items-center">
            <h4 class="mb-0"><i class="icon-plus-circle2 mr-2"></i> <span class="font-weight-semibold">@yield('page_title')</span></h4>
            <a href="#" class="header-elements-toggle text-default d-md-none ml-auto"><i class="icon-more"></i></a>
        </div>

        <div class="header-elements d-none d-md-flex align-items-center">
            {{-- Current Session --}}
            <a href="{{ Qs::userIsSuperAdmin() ? route('settings') : '' }}" class="btn btn-link btn-float text-default mr-2">
                <i class="icon-arrow-down7 text-primary"></i>
                <span class="font-weight-semibold">Current Session: {{ Qs::getSetting('current_session') }}</span>
            </a>

            {{-- User Dropdown --}}
            <div class="dropdown">
                <a href="#" class="d-flex align-items-center text-default dropdown-toggle" data-toggle="dropdown" style="text-decoration: none; gap: 8px;">
                    <img src="{{ Auth::user()->photo }}" onerror="this.src='{{ asset('global_assets/images/tab_bar.png') }}'" width="32" height="32" class="rounded-circle" alt="photo" style="border: 2px solid #2563eb;">
                    <span class="font-weight-semibold" style="font-size: 0.85rem;">{{ Auth::user()->name }}</span>
                </a>
                <div class="dropdown-menu dropdown-menu-right">
                    <a href="{{ Qs::userIsStudent() ? route('students.show', Qs::hash(Qs::findStudentRecord(Auth::user()->id)->id)) : route('users.show', Qs::hash(Auth::user()->id)) }}" class="dropdown-item">
                        <i class="icon-user-plus mr-2"></i> My Profile
                    </a>
                    <a href="{{ route('my_account') }}" class="dropdown-item">
                        <i class="icon-cog5 mr-2"></i> Account Settings
                    </a>
                    <div class="dropdown-divider"></div>
                    <a href="{{ route('logout') }}" onclick="event.preventDefault(); document.getElementById('header-logout-form').submit();" class="dropdown-item text-danger">
                        <i class="icon-switch2 mr-2"></i> Logout
                    </a>
                    <form id="header-logout-form" action="{{ route('logout') }}" method="POST" style="display:none;">@csrf</form>
                </div>
            </div>
        </div>
    </div>
</div>
